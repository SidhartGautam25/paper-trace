import { CharacterId } from '../types/game';

export type DotShape = 'circle' | 'arrow' | 'hexagon' | 'star';
export type LineStyle = 'solid' | 'dotted' | 'glow' | 'dashed' | 'dashdot' | 'outline';
export type CharacterPower = 'none' | 'short_trail' | 'armored_front' | 'ghost_trap';

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  powerName: string;
  powerDescription: string;
  shape: DotShape;
  dotColor: string;
  lineColor: string;
  lineStyle: LineStyle;
  /** Board trail stripe color (alternates with player blue/red on Nova, Bulwark, Reaper). */
  trailAccentColor?: string;
  maxTrailLength: number;
  visibleTrailLength: number;
  power: CharacterPower;
}

export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    title: 'Standard Issue',
    description: 'Balanced operator with a four-segment trail.',
    powerName: 'Full Trail',
    powerDescription: 'Last 4 moves visible. Whole body can be touched and killed.',
    shape: 'circle',
    dotColor: '#94A3B8',
    lineColor: '#CBD5E1',
    lineStyle: 'solid',
    maxTrailLength: 4,
    visibleTrailLength: 4,
    power: 'none',
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Star Striker',
    description: 'Agile striker with 3 active trail segments.',
    powerName: 'Agile Trail',
    powerDescription: '3 active trail lines. Shape: star.',
    shape: 'star',
    dotColor: '#A855F7',
    lineColor: '#C084FC',
    lineStyle: 'dotted',
    trailAccentColor: '#9F5AFF',
    maxTrailLength: 3,
    visibleTrailLength: 3,
    power: 'short_trail',
  },
  bulwark: {
    id: 'bulwark',
    name: 'Bulwark',
    title: 'Frontline Guard',
    description: 'Heavy defense unit with only 2 trail segments.',
    powerName: 'Compact Trail',
    powerDescription: 'Only 2 active trail lines. Shape: arrow.',
    shape: 'arrow',
    dotColor: '#06B6D4',
    lineColor: '#22D3EE',
    lineStyle: 'glow',
    trailAccentColor: '#00F5D4',
    maxTrailLength: 2,
    visibleTrailLength: 2,
    power: 'armored_front',
  },
  reaper: {
    id: 'reaper',
    name: 'Reaper',
    title: 'Shadow Ghost',
    description: 'Elusive unit leaving only 1 active trail segment.',
    powerName: 'Ghost Trail',
    powerDescription: 'Only 1 active trail line. Minimal vulnerability. Shape: hexagon.',
    shape: 'hexagon',
    dotColor: '#F59E0B',
    lineColor: '#FBBF24',
    lineStyle: 'dashed',
    trailAccentColor: '#FFC400',
    maxTrailLength: 1,
    visibleTrailLength: 1,
    power: 'ghost_trap',
  },
};

export const DEFAULT_CHARACTER_LOADOUT: CharacterId[] = [
  'classic',
  'classic',
  'classic',
  'classic',
];

export const CHARACTER_LIST = Object.values(CHARACTERS);

const VALID_IDS: CharacterId[] = ['classic', 'nova', 'bulwark', 'reaper'];

const LEGACY_ID_MAP: Record<string, CharacterId> = {
  phantom: 'nova',
  blitz: 'bulwark',
  fortress: 'reaper',
  fatty: 'classic',
};

function normalizeCharacterId(raw: string): CharacterId | null {
  if (VALID_IDS.includes(raw as CharacterId)) return raw as CharacterId;
  return LEGACY_ID_MAP[raw] ?? null;
}

/** Normalize any persisted or route loadout to valid character ids. */
export function sanitizeCharacterLoadout(loadout: unknown): CharacterId[] {
  if (!Array.isArray(loadout) || loadout.length === 0) {
    return DEFAULT_CHARACTER_LOADOUT;
  }
  const parsed = loadout
    .map((id) => normalizeCharacterId(String(id)))
    .filter((p): p is CharacterId => p !== null);
  if (parsed.length === 0) return DEFAULT_CHARACTER_LOADOUT;
  return parsed;
}

export function getCharacter(id: CharacterId): CharacterDefinition {
  return CHARACTERS[id] ?? CHARACTERS.classic;
}

export function getCharacterForDot(
  dotId: string,
  loadout: CharacterId[]
): CharacterDefinition {
  const slot = parseInt(dotId.split('_')[1] || '1', 10) - 1;
  const id = loadout[slot] ?? 'classic';
  return getCharacter(id);
}

export function parseCharacterLoadout(raw?: string): CharacterId[] {
  if (!raw) return DEFAULT_CHARACTER_LOADOUT;
  return sanitizeCharacterLoadout(raw.split(',').filter(Boolean));
}
