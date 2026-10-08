import { Dot, TokenPool, CharacterId, CurrencyRegion } from '../types/game';
import { DEFAULT_CHARACTER_LOADOUT } from './characters';

export const GRID_CONFIG = {
  ROWS: 22,
  COLS: 15,
  CELL_SIZE: 48,
  MAX_LINE_HISTORY: 3,
};

export const INITIAL_TOKEN_POOL: TokenPool = {
  1: 3,
  2: 3,
  3: 3,
  4: 3,
  5: 3,
};

const DOT_POSITIONS: { id: string; player: 1 | 2; pos: { r: number; c: number } }[] = [
  { id: 'p1_1', player: 1, pos: { r: 21, c: 2 } },
  { id: 'p1_2', player: 1, pos: { r: 21, c: 7 } },
  { id: 'p1_3', player: 1, pos: { r: 21, c: 12 } },
  { id: 'p2_1', player: 2, pos: { r: 0, c: 2 } },
  { id: 'p2_2', player: 2, pos: { r: 0, c: 7 } },
  { id: 'p2_3', player: 2, pos: { r: 0, c: 12 } },
];

export function createInitialDots(
  loadout: [CharacterId, CharacterId, CharacterId] = DEFAULT_CHARACTER_LOADOUT
): Dot[] {
  return DOT_POSITIONS.map((def) => {
    const slot = parseInt(def.id.split('_')[1], 10) - 1;
    return {
      id: def.id,
      player: def.player,
      characterId: loadout[slot],
      currentPos: { ...def.pos },
      history: [],
      isAlive: true,
    };
  });
}

export const INITIAL_DOTS: Dot[] = createInitialDots();

/** Region-based treasure: 3 gold, 3 silver, 4 money. */
export const INITIAL_CURRENCY_REGIONS: CurrencyRegion[] = [
  { id: 'gold_1', origin: { r: 4, c: 3 }, type: 'gold', value: 10, collected: false },
  { id: 'gold_2', origin: { r: 4, c: 10 }, type: 'gold', value: 10, collected: false },
  { id: 'gold_3', origin: { r: 17, c: 10 }, type: 'gold', value: 12, collected: false },
  { id: 'silver_1', origin: { r: 6, c: 1 }, type: 'silver', value: 5, collected: false },
  { id: 'silver_2', origin: { r: 6, c: 12 }, type: 'silver', value: 5, collected: false },
  { id: 'silver_3', origin: { r: 13, c: 6 }, type: 'silver', value: 5, collected: false },
  { id: 'money_1', origin: { r: 4, c: 7 }, type: 'money', value: 3, collected: false },
  { id: 'money_2', origin: { r: 12, c: 3 }, type: 'money', value: 3, collected: false },
  { id: 'money_3', origin: { r: 12, c: 10 }, type: 'money', value: 3, collected: false },
  { id: 'money_4', origin: { r: 17, c: 6 }, type: 'money', value: 2, collected: false },
];

export function createFreshCurrencyRegions(): CurrencyRegion[] {
  return INITIAL_CURRENCY_REGIONS.map((r) => ({
    ...r,
    origin: { ...r.origin },
    collected: false,
  }));
}

/** @deprecated */
export const INITIAL_CURRENCY_PICKUPS = INITIAL_CURRENCY_REGIONS;
export const createFreshCurrencyPickups = createFreshCurrencyRegions;
