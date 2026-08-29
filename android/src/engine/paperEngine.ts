import { GameState, Dot, TokenPool, LineSegment, Direction, PlayerWallet, CurrencyRegion, Point } from '../types/game';
import { EngineResult } from '../types/engine';
import { MoveNotification } from '../types/notifications';
import { GRID_CONFIG } from '../constants/board';
import {
  getMaxTrailLength,
  getConnectedTrailHistory,
  isTrapPointForOpponent,
  doesTrailCutKillDot,
} from './characterEngine';
import {
  getDestination,
  isWithinBounds,
  areSegmentsIntersecting,
  pointsEqual,
  getCellsAlongPath,
} from './geometry';
import { EMPTY_WALLET, mergeWallets } from '../utils/wallet';
import {
  applyFeaturesOnMove,
  canEliminateDot,
  canLandAt,
  clearForcedMoveAfterTurn,
  validateForcedMove,
  validateLandingPosition,
} from './boardFeatureEngine';
import { getMoveTouchedPoints, isSameRegionOrigin, dotLandsOnRegion } from '../types/gridRegion';
import { getFeaturesAtLanding } from '../features/boardFeatureQueries';
import { refillTokenPoolIfEmpty, getEffectiveTokenPool } from '../utils/tokenPool';
import { BOARD_FEATURE_REGISTRY } from '../features/boardFeatureRegistry';
import { BoardFeatureInstance } from '../types/boardFeatures';

function generateSegmentId(dotId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${dotId}_line_${timestamp}_${randomSuffix}`;
}

function getMaxTrailForDot(dot: Dot): number {
  return getMaxTrailLength(dot);
}

function emptyNotifications(): MoveNotification[] {
  return [];
}

function failResult(gameState: GameState, error: string): EngineResult {
  return {
    success: false,
    error,
    dots: gameState.dots,
    player1Tokens: gameState.player1Tokens,
    player2Tokens: gameState.player2Tokens,
    activePlayer: gameState.activePlayer,
    winner: gameState.winner,
    prunedLinesCount: 0,
    killedDots: [],
    currencyRegions: gameState.currencyRegions,
    matchEarnings: gameState.matchEarnings,
    currencyCollectedThisMove: EMPTY_WALLET,
    forcedMoveByPlayer: gameState.forcedMoveByPlayer,
    featureMessages: [],
    notifications: emptyNotifications(),
  };
}

function collectCurrencyRegions(
  landingPos: Point,
  regions: CurrencyRegion[],
  collectorPlayer: 1 | 2,
  boardFeatures: BoardFeatureInstance[]
): {
  regions: CurrencyRegion[];
  earned: PlayerWallet;
  notifications: MoveNotification[];
  claimedByBot: string[];
} {
  const earned: PlayerWallet = { ...EMPTY_WALLET };
  const notifications: MoveNotification[] = [];
  const claimedByBot: string[] = [];

  const updated = regions.map((region) => {
    if (region.collected) return region;
    if (!dotLandsOnRegion(landingPos, region.origin)) return region;
    if (boardFeatures.some((feature) => isSameRegionOrigin(feature.origin, region.origin))) {
      return region;
    }

    if (collectorPlayer === 1) {
      if (region.type === 'gold') earned.gold += region.value;
      else if (region.type === 'silver') earned.silver += region.value;
      else earned.money += region.value;

      const label = region.type === 'gold' ? 'Gold' : region.type === 'silver' ? 'Silver' : 'Coins';
      notifications.push({
        id: `cur_${region.id}_${Date.now()}`,
        kind: region.type,
        title: `${label} Region Captured!`,
        body: `You landed on a ${label.toLowerCase()} zone and earned +${region.value}.`,
      });
    } else {
      claimedByBot.push(region.id);
    }

    return { ...region, collected: true };
  });

  return { regions: updated, earned, notifications, claimedByBot };
}

function buildFeatureNotifications(
  activePlayer: 1 | 2,
  touchedFeatures: BoardFeatureInstance[],
  featureMessages: string[]
): MoveNotification[] {
  if (activePlayer !== 1) return [];

  const notifs: MoveNotification[] = [];
  const seen = new Set<string>();

  for (const feature of touchedFeatures) {
    if (seen.has(feature.typeId)) continue;
    seen.add(feature.typeId);
    const def = BOARD_FEATURE_REGISTRY[feature.typeId];

    if (feature.typeId === 'shield_zone') {
      notifs.push({
        id: `feat_${feature.id}`,
        kind: 'shield_zone',
        title: 'Sanctuary Region',
        body: 'Sanctuary: your dot cannot be cut here. Only one dot may occupy the four-dot region.',
      });
    } else if (feature.typeId === 'trail_erase') {
      notifs.push({
        id: `feat_${feature.id}`,
        kind: 'trail_erase',
        title: 'Trail Purge Region',
        body: featureMessages.find((m) => m.includes('Trail Purge')) ?? def.description,
      });
    } else if (feature.typeId === 'forced_lock') {
      notifs.push({
        id: `feat_${feature.id}`,
        kind: 'forced_lock',
        title: 'Lock Region',
        body: featureMessages.find((m) => m.includes('Lock')) ?? def.description,
      });
    }
  }

  return notifs;
}

export function executeShot(
  movingDotId: string,
  direction: Direction,
  tokenValue: number,
  gameState: GameState
): EngineResult {
  const { dots, player1Tokens, player2Tokens, activePlayer } = gameState;

  const forcedError = validateForcedMove(movingDotId, activePlayer, gameState);
  if (forcedError) {
    return failResult(gameState, forcedError);
  }

  const movingDotIndex = dots.findIndex((d) => d.id === movingDotId);
  if (movingDotIndex === -1) {
    return failResult(gameState, `Dot with ID "${movingDotId}" not found.`);
  }

  const movingDot = dots[movingDotIndex];

  if (!movingDot.isAlive) {
    return failResult(gameState, 'Cannot move a destroyed dot.');
  }

  if (movingDot.player !== activePlayer) {
    return failResult(gameState, "Cannot move opponent's dot.");
  }

  const activePool = getEffectiveTokenPool(
    activePlayer === 1 ? player1Tokens : player2Tokens
  );
  if (!activePool[tokenValue] || activePool[tokenValue] <= 0) {
    return failResult(gameState, `Token value ${tokenValue} is not available in your pool.`);
  }

  const startPos = movingDot.currentPos;
  const endPos = getDestination(startPos, direction, tokenValue);

  if (!isWithinBounds(endPos)) {
    return failResult(gameState, 'Shot exceeds grid boundaries.');
  }

  const landingError = validateLandingPosition(endPos, movingDotId, gameState);
  if (landingError) {
    return failResult(gameState, landingError);
  }

  const pathCells = getCellsAlongPath(startPos, endPos);
  const touchedPoints = getMoveTouchedPoints(startPos, pathCells);

  const newSegmentId = generateSegmentId(movingDotId);
  const newSegment: LineSegment = {
    id: newSegmentId,
    start: startPos,
    end: endPos,
  };

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

  updatedDots.forEach((d) => {
    if (d.player !== activePlayer && d.isAlive) {
      if (pointsEqual(endPos, d.currentPos) && canEliminateDot(d, gameState.boardFeatures)) {
        d.isAlive = false;
        d.history = [];
        killedDots.push(d.id);
      }
    }
  });

  updatedDots.forEach((d) => {
    if (d.player !== activePlayer && d.isAlive) {
      if (doesTrailCutKillDot(d, newSegment.start, newSegment.end, gameState.boardFeatures)) {
        d.isAlive = false;
        d.history = [];
        if (!killedDots.includes(d.id)) {
          killedDots.push(d.id);
        }
      }
    }
  });

  updatedDots.forEach((d) => {
    if (d.player === activePlayer && d.isAlive) {
      const initialHistoryLength = d.history.length;
      d.history = d.history.filter((seg) => {
        const intersects = areSegmentsIntersecting(
          newSegment.start,
          newSegment.end,
          seg.start,
          seg.end,
          true
        );
        return !intersects;
      });
      d.history = getConnectedTrailHistory(d.history, d.currentPos);
      prunedLinesCount += initialHistoryLength - d.history.length;
    }
  });

  const finalMovingDot = updatedDots.find((d) => d.id === movingDotId)!;
  finalMovingDot.currentPos = endPos;
  finalMovingDot.history.push(newSegment);

  const maxTrail = getMaxTrailForDot(finalMovingDot);
  while (finalMovingDot.history.length > maxTrail) {
    finalMovingDot.history.shift();
  }

  let diedOnReaperTrap = false;
  if (
    finalMovingDot.isAlive &&
    isTrapPointForOpponent(endPos, updatedDots, activePlayer)
  ) {
    finalMovingDot.isAlive = false;
    finalMovingDot.history = [];
    if (!killedDots.includes(movingDotId)) {
      killedDots.push(movingDotId);
    }
    diedOnReaperTrap = true;
  }

  const landedFeatures = getFeaturesAtLanding(endPos, gameState.boardFeatures);

  const featureResult = applyFeaturesOnMove({
    gameState,
    movingDotId,
    movingDot: finalMovingDot,
    endPos,
    touchedPoints,
    newSegment,
    updatedDots,
    activePlayer,
  });

  let resolvedDots = featureResult.dots ?? updatedDots;
  let forcedMoveByPlayer = featureResult.forcedMoveByPlayer
    ? { ...gameState.forcedMoveByPlayer, ...featureResult.forcedMoveByPlayer }
    : { ...gameState.forcedMoveByPlayer };

  let featureMessages = featureResult.featureMessages ?? [];

  const {
    regions: updatedRegions,
    earned,
    notifications: currencyNotifs,
    claimedByBot,
  } = collectCurrencyRegions(
    endPos,
    gameState.currencyRegions,
    activePlayer,
    gameState.boardFeatures
  );

  for (const id of claimedByBot) {
    const region = gameState.currencyRegions.find((r) => r.id === id);
    if (!region) continue;
    const label = region.type === 'gold' ? 'gold' : region.type === 'silver' ? 'silver' : 'coin';
    featureMessages.push(`Bot captured ${label} treasure — region cleared`);
  }

  const featureNotifs = buildFeatureNotifications(activePlayer, landedFeatures, featureMessages);
  const trapNotifs: MoveNotification[] =
    diedOnReaperTrap && activePlayer === 1
      ? [
          {
            id: `trap_${movingDotId}_${Date.now()}`,
            kind: 'reaper_trap',
            title: 'Reaper Trap!',
            body: 'You stepped on a lethal trap point and were eliminated.',
          },
        ]
      : [];
  const notifications = [...currencyNotifs, ...featureNotifs, ...trapNotifs];
  if (diedOnReaperTrap) {
    featureMessages = [
      ...featureMessages,
      activePlayer === 1 ? 'Reaper trap triggered!' : 'Bot fell into a Reaper trap!',
    ];
  }
  const matchEarnings = mergeWallets(gameState.matchEarnings, earned);

  let updatedPlayer1Tokens = { ...player1Tokens };
  let updatedPlayer2Tokens = { ...player2Tokens };
  if (activePlayer === 1) {
    updatedPlayer1Tokens[tokenValue] = Math.max(0, updatedPlayer1Tokens[tokenValue] - 1);
  } else {
    updatedPlayer2Tokens[tokenValue] = Math.max(0, updatedPlayer2Tokens[tokenValue] - 1);
  }

  const nextPlayer = activePlayer === 1 ? 2 : 1;
  if (nextPlayer === 1) {
    updatedPlayer1Tokens = refillTokenPoolIfEmpty(updatedPlayer1Tokens);
  } else {
    updatedPlayer2Tokens = refillTokenPoolIfEmpty(updatedPlayer2Tokens);
  }

  forcedMoveByPlayer = clearForcedMoveAfterTurn(activePlayer, forcedMoveByPlayer);

  const p1AliveCount = resolvedDots.filter((d) => d.player === 1 && d.isAlive).length;
  const p2AliveCount = resolvedDots.filter((d) => d.player === 2 && d.isAlive).length;

  let winner: 1 | 2 | null = null;
  if (p2AliveCount === 0 && p1AliveCount > 0) {
    winner = 1;
  } else if (p1AliveCount === 0 && p2AliveCount > 0) {
    winner = 2;
  } else if (p1AliveCount === 0 && p2AliveCount === 0) {
    winner = activePlayer;
  } else {
    const nextPlayerPool = getEffectiveTokenPool(
      nextPlayer === 1 ? updatedPlayer1Tokens : updatedPlayer2Tokens
    );
    if (!hasAnyValidMoves(nextPlayer, resolvedDots, nextPlayerPool, gameState.boardFeatures)) {
      winner = resolveEndGameWinner(resolvedDots);
    }
  }

  return {
    success: true,
    dots: resolvedDots,
    player1Tokens: updatedPlayer1Tokens,
    player2Tokens: updatedPlayer2Tokens,
    activePlayer: winner ? activePlayer : nextPlayer,
    winner,
    prunedLinesCount,
    killedDots,
    currencyRegions: updatedRegions,
    matchEarnings,
    currencyCollectedThisMove: earned,
    forcedMoveByPlayer,
    featureMessages,
    notifications,
  };
}

export function hasAnyValidMoves(
  player: 1 | 2,
  dots: Dot[],
  tokens: TokenPool,
  boardFeatures: GameState['boardFeatures']
): boolean {
  const aliveDots = dots.filter((d) => d.player === player && d.isAlive);
  if (aliveDots.length === 0) return false;

  const pool = getEffectiveTokenPool(tokens);
  const availableTokens = Object.keys(pool)
    .map(Number)
    .filter((val) => pool[val] > 0);
  if (availableTokens.length === 0) return false;

  const directions: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  for (const dot of aliveDots) {
    for (const token of availableTokens) {
      for (const dir of directions) {
        const dest = getDestination(dot.currentPos, dir, token);
        if (isWithinBounds(dest) && canLandAt(dest, dot.id, dots, boardFeatures)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function resolveEndGameWinner(dots: Dot[]): 1 | 2 {
  const p1Alive = dots.filter((d) => d.player === 1 && d.isAlive);
  const p2Alive = dots.filter((d) => d.player === 2 && d.isAlive);

  if (p1Alive.length > p2Alive.length) return 1;
  if (p2Alive.length > p1Alive.length) return 2;

  const maxRow = GRID_CONFIG.ROWS - 1;
  const p1Score = p1Alive.reduce((sum, d) => sum + (maxRow - d.currentPos.r), 0);
  const p2Score = p2Alive.reduce((sum, d) => sum + d.currentPos.r, 0);

  if (p1Score > p2Score) return 1;
  if (p2Score > p1Score) return 2;

  return 1;
}
