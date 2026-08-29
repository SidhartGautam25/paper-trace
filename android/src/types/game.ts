import { BoardFeatureInstance, ForcedMoveByPlayer } from './boardFeatures';

export type { BoardFeatureInstance, BoardFeatureTypeId, ForcedMoveByPlayer } from './boardFeatures';
export { EMPTY_FORCED_MOVE } from './boardFeatures';

export interface Point {
  r: number; // Row index (0-indexed)
  c: number; // Column index (0-indexed)
}

export interface LineSegment {
  id: string; // Unique ID for key mapping in React Native SVG
  start: Point;
  end: Point;
}

export type CharacterId = 'classic' | 'nova' | 'bulwark' | 'reaper';
export type CurrencyType = 'gold' | 'silver' | 'money';

export interface PlayerWallet {
  gold: number;
  silver: number;
  money: number;
}

/** Treasure zone — collected when player's dot touches any of the four corner dots. */
export interface CurrencyRegion {
  id: string;
  origin: import('./gridRegion').RegionOrigin;
  type: CurrencyType;
  value: number;
  collected: boolean;
}

/** @deprecated Use CurrencyRegion */
export type CurrencyPickup = CurrencyRegion;

export interface Dot {
  id: string; // Unique identifier, e.g., "p1_1", "p2_3"
  player: 1 | 2;
  characterId: CharacterId;
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
  historyLogs: string[];
  currencyRegions: CurrencyRegion[];
  matchEarnings: PlayerWallet;
  boardFeatures: BoardFeatureInstance[];
  forcedMoveByPlayer: ForcedMoveByPlayer;
}
