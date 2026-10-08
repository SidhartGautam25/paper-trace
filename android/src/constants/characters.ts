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
    description: 'Balanced operator with a full three-segment trail.',
    powerName: 'No Power',
    powerDescription: 'Standard three-line trail. Shape: round dot.',
    shape: 'circle',
    dotColor: '#94A3B8',
    lineColor: '#CBD5E1',
    lineStyle: 'solid',
    maxTrailLength: 3,
    visibleTrailLength: 3,
    power: 'none',
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    title: 'Star Striker',
    description: 'Light footprint — only two trail segments stay on the board.',
    powerName: 'Short Trail',
    powerDescription: 'Only 2 active trail lines. Shape: star.',
    shape: 'star',
    dotColor: '#9B51E0',
    lineColor: '#B47AFF',
    lineStyle: 'dotted',
    trailAccentColor: '#9D6BFF',
    maxTrailLength: 2,
    visibleTrailLength: 2,
    power: 'short_trail',
  },
  bulwark: {
    id: 'bulwark',
    name: 'Bulwark',
    title: 'Frontline Guard',
    description: 'Heavy unit — dot and leading line cannot be cut.',
    powerName: 'Armored Front',
    powerDescription:
      '3 active lines. Only the line attached to your dot is armored — cut the 2nd or 3rd line to kill.',
    shape: 'arrow',
    dotColor: '#00F2FF',
    lineColor: '#00D4FF',
    lineStyle: 'glow',
    trailAccentColor: '#18D4B8',
    maxTrailLength: 3,
    visibleTrailLength: 3,
    power: 'armored_front',
  },
  reaper: {
    id: 'reaper',
    name: 'Reaper',
    title: 'Trap Weaver',
    description: 'Two visible lines hide a lethal ghost trail.',
    powerName: 'Ghost Trap',
    powerDescription:
      '2 visible lines + 1 hidden trap line. Red dots mark lethal points. Shape: hexagon.',
    shape: 'hexagon',
    dotColor: '#FFB900',
    lineColor: '#FFD54F',
    lineStyle: 'dashed',
    trailAccentColor: '#F0A500',
    maxTrailLength: 3,
    visibleTrailLength: 2,
    power: 'ghost_trap',
  },
};

export const DEFAULT_CHARACTER_LOADOUT: [CharacterId, CharacterId, CharacterId] = [
  'classic',
  'nova',
  'bulwark',
];

export const CHARACTER_LIST = Object.values(CHARACTERS);

const VALID_IDS: CharacterId[] = ['classic', 'nova', 'bulwark', 'reaper'];

const LEGACY_ID_MAP: Record<string, CharacterId> = {
  phantom: 'nova',
  blitz: 'bulwark',
  fortress: 'reaper',
};

function normalizeCharacterId(raw: string): CharacterId | null {
  if (VALID_IDS.includes(raw as CharacterId)) return raw as CharacterId;
  return LEGACY_ID_MAP[raw] ?? null;
}

/** Normalize any persisted or route loadout to valid character ids. */
export function sanitizeCharacterLoadout(
  loadout: unknown
): [CharacterId, CharacterId, CharacterId] {
  if (!Array.isArray(loadout) || loadout.length !== 3) {
    return DEFAULT_CHARACTER_LOADOUT;
  }
  const parsed = loadout
    .map((id) => normalizeCharacterId(String(id)))
    .filter((p): p is CharacterId => p !== null);
  if (parsed.length !== 3) return DEFAULT_CHARACTER_LOADOUT;
  return parsed as [CharacterId, CharacterId, CharacterId];
}

export function getCharacter(id: CharacterId): CharacterDefinition {
  return CHARACTERS[id] ?? CHARACTERS.classic;
}

export function getCharacterForDot(
  dotId: string,
  loadout: [CharacterId, CharacterId, CharacterId]
): CharacterDefinition {
  const slot = parseInt(dotId.split('_')[1] || '1', 10) - 1;
  if (slot >= loadout.length) return getCharacter('reaper');
  return getCharacter(loadout[Math.max(0, slot)]);
}

export function parseCharacterLoadout(raw?: string): [CharacterId, CharacterId, CharacterId] {
  if (!raw) return DEFAULT_CHARACTER_LOADOUT;
  return sanitizeCharacterLoadout(raw.split(',').filter(Boolean));
}
