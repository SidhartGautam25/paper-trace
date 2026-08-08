import { Dot, TokenPool } from '../types/game';

export const GRID_CONFIG = {
  ROWS: 15,
  COLS: 11,
  CELL_SIZE: 35, // grid cell sizing in density pixels
  MAX_LINE_HISTORY: 3,
};

export const INITIAL_TOKEN_POOL: TokenPool = {
  1: 3,
  2: 3,
  3: 3,
  4: 3,
  5: 3,
};

export const INITIAL_DOTS: Dot[] = [
  // Player 1 (Bottom, active player 1)
  {
    id: 'p1_1',
    player: 1,
    currentPos: { r: 14, c: 2 },
    history: [],
    isAlive: true,
  },
  {
    id: 'p1_2',
    player: 1,
    currentPos: { r: 14, c: 5 },
    history: [],
    isAlive: true,
  },
  {
    id: 'p1_3',
    player: 1,
    currentPos: { r: 14, c: 8 },
    history: [],
    isAlive: true,
  },
  // Player 2 (Top, active player 2)
  {
    id: 'p2_1',
    player: 2,
    currentPos: { r: 0, c: 2 },
    history: [],
    isAlive: true,
  },
  {
    id: 'p2_2',
    player: 2,
    currentPos: { r: 0, c: 5 },
    history: [],
    isAlive: true,
  },
  {
    id: 'p2_3',
    player: 2,
    currentPos: { r: 0, c: 8 },
    history: [],
    isAlive: true,
  },
];
