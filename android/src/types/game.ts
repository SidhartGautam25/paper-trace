export interface Point {
  r: number; // Row index (0-indexed)
  c: number; // Column index (0-indexed)
}

export interface LineSegment {
  id: string; // Unique ID for key mapping in React Native SVG
  start: Point;
  end: Point;
}

export interface Dot {
  id: string; // Unique identifier, e.g., "p1_1", "p2_3"
  player: 1 | 2;
  currentPos: Point;
  history: LineSegment[]; // Line history queue (Max 3 moves)
  isAlive: boolean;
}

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface TokenPool {
  [key: number]: number; // Token value (1 to 5) mapped to remaining count
}

export interface GameState {
  dots: Dot[];
  player1Tokens: TokenPool;
  player2Tokens: TokenPool;
  activePlayer: 1 | 2;
  winner: 1 | 2 | null;
  historyLogs: string[]; // Match log records
}
