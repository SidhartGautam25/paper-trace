import { BoardFeatureInstance } from '../types/boardFeatures';
import { INITIAL_CURRENCY_REGIONS } from './board';
import { assertUniqueRegionOrigins } from '../types/gridRegion';

/** Region-based special tiles — reduced density vs point markers. */
export const BOARD_FEATURE_PLACEMENTS: BoardFeatureInstance[] = [
  { id: 'shield_center', typeId: 'shield_zone', origin: { r: 6, c: 4 } },
  { id: 'erase_bot', typeId: 'trail_erase', origin: { r: 1, c: 4 } },
  { id: 'erase_player', typeId: 'trail_erase', origin: { r: 11, c: 4 } },
  { id: 'lock_bot', typeId: 'forced_lock', origin: { r: 3, c: 2 } },
  { id: 'lock_player', typeId: 'forced_lock', origin: { r: 9, c: 6 } },
];

assertUniqueRegionOrigins([
  ...INITIAL_CURRENCY_REGIONS.map((region) => ({ id: region.id, origin: region.origin })),
  ...BOARD_FEATURE_PLACEMENTS.map((feature) => ({ id: feature.id, origin: feature.origin })),
]);

export function createBoardFeatures(): BoardFeatureInstance[] {
  return BOARD_FEATURE_PLACEMENTS.map((f) => ({
    ...f,
    origin: { ...f.origin },
  }));
}
