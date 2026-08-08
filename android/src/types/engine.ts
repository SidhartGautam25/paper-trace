import { Dot, TokenPool } from './game';

export interface EngineResult {
  success: boolean;
  error?: string;
  dots: Dot[];
  player1Tokens: TokenPool;
  player2Tokens: TokenPool;
  activePlayer: 1 | 2;
  winner: 1 | 2 | null;
  prunedLinesCount: number;
  killedDots: string[]; // Dot IDs that were killed during this move
}
