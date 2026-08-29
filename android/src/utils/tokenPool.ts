import { TokenPool } from '../types/game';

const TOKEN_VALUES = [1, 2, 3, 4, 5] as const;

export function isTokenPoolEmpty(pool: TokenPool): boolean {
  return TOKEN_VALUES.every((value) => (pool[value] ?? 0) <= 0);
}

/** When a player has no tokens left, grant one move of distance 3 until the match ends. */
export function refillTokenPoolIfEmpty(pool: TokenPool): TokenPool {
  if (!isTokenPoolEmpty(pool)) return pool;
  return { ...pool, 3: 1 };
}

export function getEffectiveTokenPool(pool: TokenPool): TokenPool {
  return refillTokenPoolIfEmpty(pool);
}
