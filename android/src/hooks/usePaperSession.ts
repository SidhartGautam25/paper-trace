import { useState, useEffect } from 'react';
import { GameState, Dot, TokenPool, Direction } from '../types/game';
import { INITIAL_DOTS, INITIAL_TOKEN_POOL } from '../constants/board';
import { executeShot, hasAnyValidMoves, resolveEndGameWinner } from '../engine/paperEngine';
import { recordGameOutcome } from '../utils/stats';
import { getBestMove } from '../engine/aiEngine';

const getDotLabel = (id: string, player: 1 | 2): string => {
  const num = id.split('_')[1] || '1';
  const name = player === 1 ? 'Player' : 'Bot';
  return `${name} (Dot ${num})`;
};

export function usePaperSession(
  initialDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
) {
  const [dots, setDots] = useState<Dot[]>(INITIAL_DOTS);
  const [player1Tokens, setPlayer1Tokens] = useState<TokenPool>(INITIAL_TOKEN_POOL);
  const [player2Tokens, setPlayer2Tokens] = useState<TokenPool>(INITIAL_TOKEN_POOL);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [historyLogs, setHistoryLogs] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialDifficulty);

  // Selection states (for human Player 1)
  const [selectedDotId, setSelectedDotId] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Reset parameters when active player changes & auto-select if only 1 dot alive
  useEffect(() => {
    const aliveP1Dots = dots.filter((d) => d.player === 1 && d.isAlive);
    if (activePlayer === 1 && aliveP1Dots.length === 1) {
      setSelectedDotId(aliveP1Dots[0].id);
    } else {
      setSelectedDotId(null);
    }
    setSelectedToken(null);
    setSelectedDirection(null);
  }, [activePlayer, dots]);

  // Player 1 Move Check Trigger
  useEffect(() => {
    if (activePlayer === 1 && !winner) {
      if (!hasAnyValidMoves(1, dots, player1Tokens)) {
        setWinner(resolveEndGameWinner(dots));
      }
    }
  }, [activePlayer, winner, dots, player1Tokens]);

  // Record stats on game resolution
  useEffect(() => {
    if (winner !== null) {
      recordGameOutcome(winner === 1 ? 'win' : 'loss');
    }
  }, [winner]);

  // AI Auto-Move Execution Trigger
  useEffect(() => {
    if (activePlayer === 2 && !winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const currentGameState: GameState = {
          dots,
          player1Tokens,
          player2Tokens,
          activePlayer,
          winner,
          historyLogs,
        };

        const bestMove = getBestMove(currentGameState, difficulty);

        if (bestMove) {
          const result = executeShot(bestMove.dotId, bestMove.direction, bestMove.tokenValue, currentGameState);
          if (result.success) {
            setDots(result.dots);
            setPlayer1Tokens(result.player1Tokens);
            setPlayer2Tokens(result.player2Tokens);
            setActivePlayer(result.activePlayer);
            setWinner(result.winner);

            // Log AI turn details
            const botDotLabel = getDotLabel(bestMove.dotId, 2);
            let logMsg = `${botDotLabel} shoots ${bestMove.direction} (dist ${bestMove.tokenValue})`;
            if (result.killedDots.length > 0) {
              const killedLabels = result.killedDots.map((id) => getDotLabel(id, 1));
              logMsg += ` 🎯 KILLS ${killedLabels.join(', ')}!`;
            }
            if (result.prunedLinesCount > 0) {
              logMsg += ` ✂️ (pruned ${result.prunedLinesCount} paths)`;
            }
            setHistoryLogs((prev) => [logMsg, ...prev]);
          } else {
            setActivePlayer(1);
          }
        } else {
          setWinner(resolveEndGameWinner(dots));
        }
        setIsAiThinking(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [activePlayer, winner, dots, player1Tokens, player2Tokens, difficulty]);

  const selectDot = (dotId: string) => {
    if (activePlayer !== 1 || winner) return;
    const dot = dots.find((d) => d.id === dotId);
    if (dot && dot.player === 1 && dot.isAlive) {
      setSelectedDotId(dotId);
    }
  };

  const selectToken = (value: number) => {
    if (activePlayer !== 1 || winner) return;
    if (player1Tokens[value] > 0) {
      setSelectedToken(value);
    }
  };

  const selectDirection = (dir: Direction) => {
    if (activePlayer !== 1 || winner) return;
    setSelectedDirection(dir);
  };

  const executeMove = (): { success: boolean; error?: string } => {
    if (activePlayer !== 1 || winner) {
      return { success: false, error: 'Not your turn.' };
    }
    if (!selectedDotId || selectedToken === null || !selectedDirection) {
      return { success: false, error: 'Please choose a Dot, Token, and Direction.' };
    }

    const currentGameState: GameState = {
      dots,
      player1Tokens,
      player2Tokens,
      activePlayer,
      winner,
      historyLogs,
    };

    const result = executeShot(selectedDotId, selectedDirection, selectedToken, currentGameState);
    if (result.success) {
      setDots(result.dots);
      setPlayer1Tokens(result.player1Tokens);
      setPlayer2Tokens(result.player2Tokens);
      setActivePlayer(result.activePlayer);
      setWinner(result.winner);

      // Log player turn details
      const playerDotLabel = getDotLabel(selectedDotId, 1);
      let logMsg = `${playerDotLabel} shoots ${selectedDirection} (dist ${selectedToken})`;
      if (result.killedDots.length > 0) {
        const killedLabels = result.killedDots.map((id) => getDotLabel(id, 2));
        logMsg += ` 🎯 KILLS ${killedLabels.join(', ')}!`;
      }
      if (result.prunedLinesCount > 0) {
        logMsg += ` ✂️ (pruned ${result.prunedLinesCount} paths)`;
      }
      setHistoryLogs((prev) => [logMsg, ...prev]);

      setSelectedDotId(null);
      setSelectedToken(null);
      setSelectedDirection(null);
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const resetGame = () => {
    setDots(INITIAL_DOTS);
    setPlayer1Tokens(INITIAL_TOKEN_POOL);
    setPlayer2Tokens(INITIAL_TOKEN_POOL);
    setActivePlayer(1);
    setWinner(null);
    setHistoryLogs([]);
    setSelectedDotId(null);
    setSelectedToken(null);
    setSelectedDirection(null);
    setIsAiThinking(false);
  };

  return {
    dots,
    player1Tokens,
    player2Tokens,
    activePlayer,
    winner,
    historyLogs,
    difficulty,
    setDifficulty,
    selectedDotId,
    selectedToken,
    selectedDirection,
    isAiThinking,
    selectDot,
    selectToken,
    selectDirection,
    executeMove,
    resetGame,
  };
}
