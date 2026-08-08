import { GameState, Dot, TokenPool, LineSegment, Direction } from '../types/game';
import { EngineResult } from '../types/engine';
import { GRID_CONFIG } from '../constants/board';
import {
  getDestination,
  isWithinBounds,
  areSegmentsIntersecting,
  pointsEqual,
} from './geometry';

/**
 * Generates a unique ID for a line segment.
 */
function generateSegmentId(dotId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${dotId}_line_${timestamp}_${randomSuffix}`;
}

/**
 * Executes a player move (shot).
 * Returns the new game state snapshot wrapped in an EngineResult.
 */
export function executeShot(
  movingDotId: string,
  direction: Direction,
  tokenValue: number,
  gameState: GameState
): EngineResult {
  const { dots, player1Tokens, player2Tokens, activePlayer } = gameState;

  // 1. Locate the moving dot
  const movingDotIndex = dots.findIndex((d) => d.id === movingDotId);
  if (movingDotIndex === -1) {
    return { success: false, error: `Dot with ID "${movingDotId}" not found.`, dots, player1Tokens, player2Tokens, activePlayer, winner: gameState.winner, prunedLinesCount: 0, killedDots: [] };
  }

  const movingDot = dots[movingDotIndex];

  // 2. Validate dot state
  if (!movingDot.isAlive) {
    return { success: false, error: 'Cannot move a destroyed dot.', dots, player1Tokens, player2Tokens, activePlayer, winner: gameState.winner, prunedLinesCount: 0, killedDots: [] };
  }

  if (movingDot.player !== activePlayer) {
    return { success: false, error: 'Cannot move opponent\'s dot.', dots, player1Tokens, player2Tokens, activePlayer, winner: gameState.winner, prunedLinesCount: 0, killedDots: [] };
  }

  // 3. Validate token availability
  const activePool = activePlayer === 1 ? player1Tokens : player2Tokens;
  if (!activePool[tokenValue] || activePool[tokenValue] <= 0) {
    return { success: false, error: `Token value ${tokenValue} is not available in your pool.`, dots, player1Tokens, player2Tokens, activePlayer, winner: gameState.winner, prunedLinesCount: 0, killedDots: [] };
  }

  // 4. Calculate destination and check boundary bounds
  const startPos = movingDot.currentPos;
  const endPos = getDestination(startPos, direction, tokenValue);

  if (!isWithinBounds(endPos)) {
    return { success: false, error: 'Shot exceeds grid boundaries.', dots, player1Tokens, player2Tokens, activePlayer, winner: gameState.winner, prunedLinesCount: 0, killedDots: [] };
  }

  // Create the new line segment
  const newSegmentId = generateSegmentId(movingDotId);
  const newSegment: LineSegment = {
    id: newSegmentId,
    start: startPos,
    end: endPos,
  };

  // Clone structures for immutability
  const updatedDots: Dot[] = dots.map((d) => ({
    ...d,
    currentPos: { ...d.currentPos },
    history: d.history.map((seg) => ({
      ...seg,
      start: { ...seg.start },
      end: { ...seg.end },
    })),
  }));

  const killedDots: string[] = [];
  let prunedLinesCount = 0;

  // 5. Collision Checks
  // A. Direct Hit Check: If we land directly on an enemy dot's current coordinates
  updatedDots.forEach((d) => {
    if (d.player !== activePlayer && d.isAlive) {
      if (pointsEqual(endPos, d.currentPos)) {
        d.isAlive = false;
        d.history = []; // Clear lines of dead dots
        killedDots.push(d.id);
      }
    }
  });

  // B. Enemy Line Cut Check: If our new segment intersects any active enemy line segments
  updatedDots.forEach((d) => {
    if (d.player !== activePlayer && d.isAlive) {
      const hasIntersection = d.history.some((seg) =>
        areSegmentsIntersecting(newSegment.start, newSegment.end, seg.start, seg.end, false)
      );
      if (hasIntersection) {
        d.isAlive = false;
        d.history = []; // Clear lines of dead dots
        if (!killedDots.includes(d.id)) {
          killedDots.push(d.id);
        }
      }
    }
  });

  // C. Self-Cancellation (Friendly Line Pruning) Check:
  // If our new segment intersects any of our own (friendly) active line segments,
  // we erase those intersected line segments.
  updatedDots.forEach((d) => {
    if (d.player === activePlayer && d.isAlive) {
      const initialHistoryLength = d.history.length;
      d.history = d.history.filter((seg) => {
        // If it intersects, prune it (exclude from history)
        const intersects = areSegmentsIntersecting(
          newSegment.start,
          newSegment.end,
          seg.start,
          seg.end,
          true // ignoreNewStartJoint: don't prune segments connecting at the new shot's origin
        );
        return !intersects;
      });
      prunedLinesCount += initialHistoryLength - d.history.length;
    }
  });

  // 6. Update the moving dot itself
  const finalMovingDot = updatedDots.find((d) => d.id === movingDotId)!;
  finalMovingDot.currentPos = endPos;
  finalMovingDot.history.push(newSegment);

  // FIFO history truncation: max 3 lines
  if (finalMovingDot.history.length > GRID_CONFIG.MAX_LINE_HISTORY) {
    finalMovingDot.history.shift();
  }

  // 7. Decrement the token value from the active player's inventory
  const updatedPlayer1Tokens = { ...player1Tokens };
  const updatedPlayer2Tokens = { ...player2Tokens };
  if (activePlayer === 1) {
    updatedPlayer1Tokens[tokenValue] = Math.max(0, updatedPlayer1Tokens[tokenValue] - 1);
  } else {
    updatedPlayer2Tokens[tokenValue] = Math.max(0, updatedPlayer2Tokens[tokenValue] - 1);
  }

  // 8. Determine victory conditions
  const p1AliveCount = updatedDots.filter((d) => d.player === 1 && d.isAlive).length;
  const p2AliveCount = updatedDots.filter((d) => d.player === 2 && d.isAlive).length;

  let winner: 1 | 2 | null = null;
  if (p2AliveCount === 0 && p1AliveCount > 0) {
    winner = 1;
  } else if (p1AliveCount === 0 && p2AliveCount > 0) {
    winner = 2;
  } else if (p1AliveCount === 0 && p2AliveCount === 0) {
    // Highly unlikely tie, give win to active player
    winner = activePlayer;
  }

  // 9. Swap Active Player
  const nextPlayer = activePlayer === 1 ? 2 : 1;

  return {
    success: true,
    dots: updatedDots,
    player1Tokens: updatedPlayer1Tokens,
    player2Tokens: updatedPlayer2Tokens,
    activePlayer: winner ? activePlayer : nextPlayer, // Keep active player if game ended
    winner,
    prunedLinesCount,
    killedDots,
  };
}
