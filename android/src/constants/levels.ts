import { CharacterId, Point } from '../types/game';

export interface PosPowerItem {
  type: string;
  coordinates: Point[];
}

export interface LevelConfig {
  id: number;
  name: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /**
   * Declarative character assignment for all 4 dots.
   * To change character for any dot in this level, change it right here!
   * Supported: 'classic' | 'nova' | 'bulwark' | 'reaper'
   */
  dots: {
    dot1: CharacterId;
    dot2: CharacterId;
    dot3: CharacterId;
    dot4: CharacterId;
  };
  /**
   * Optional bot dots configuration. If omitted, bot uses the same dot characters as dots above.
   */
  botDots?: {
    dot1: CharacterId;
    dot2: CharacterId;
    dot3: CharacterId;
    dot4: CharacterId;
  };
  /**
   * Declarative position power / board obstacles configuration.
   * Defines BLACK_BOX coordinates that become impassable dark hexes.
   * Supports both array of items: [{ type: 'BLACK_BOX', coordinates: [...] }]
   * or direct object: { BLACK_BOX: [...] }.
   */
  pos_power?:
    | {
        BLACK_BOX?: Point[];
        [key: string]: any;
      }
    | PosPowerItem[];
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Level 1',
    title: 'Training Grounds',
    description: 'Easy AI • 4 Classic Dots',
    difficulty: 'easy',
    dots: {
      dot1: 'classic',
      dot2: 'classic',
      dot3: 'classic',
      dot4: 'classic',
    },
    pos_power: [
      {
        type: 'BLACK_BOX',
        coordinates: [],
      },
    ],
  },
  {
    id: 2,
    name: 'Level 2',
    title: 'Ink Skirmish',
    description: 'Medium AI • 4 Classic Dots',
    difficulty: 'medium',
    dots: {
      dot1: 'classic',
      dot2: 'classic',
      dot3: 'classic',
      dot4: 'classic',
    },
    pos_power: [
      {
        type: 'BLACK_BOX',
        coordinates: [],
      },
    ],
  },
  {
    id: 3,
    name: 'Level 3',
    title: 'Tactical Clash',
    description: 'Hard AI (Minimax) • 4 Classic Dots',
    difficulty: 'hard',
    dots: {
      dot1: 'classic',
      dot2: 'classic',
      dot3: 'classic',
      dot4: 'classic',
    },
    pos_power: [
      {
        type: 'BLACK_BOX',
        coordinates: [],
      },
    ],
  },
  {
    id: 4,
    name: 'Level 4',
    title: 'Iron Pillars',
    description: 'Medium AI • 12 Obstacle Blocks',
    difficulty: 'medium',
    dots: {
      dot1: 'classic',
      dot2: 'classic',
      dot3: 'classic',
      dot4: 'classic',
    },
    pos_power: [
      {
        type: 'BLACK_BOX',
        coordinates: [
          { r: 8, c: 3 },
          { r: 8, c: 4 },
          { r: 8, c: 10 },
          { r: 8, c: 11 },
          { r: 12, c: 3 },
          { r: 12, c: 4 },
          { r: 12, c: 10 },
          { r: 12, c: 11 },
          { r: 16, c: 3 },
          { r: 16, c: 4 },
          { r: 16, c: 10 },
          { r: 16, c: 11 },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Level 5',
    title: 'Divided Valley',
    description: 'Hard AI • 20 Obstacle Blocks',
    difficulty: 'hard',
    dots: {
      dot1: 'classic',
      dot2: 'classic',
      dot3: 'classic',
      dot4: 'classic',
    },
    pos_power: [
      {
        type: 'BLACK_BOX',
        coordinates: [
          // Top-left continuous wall (3 hexes)
          { r: 7, c: 3 },
          { r: 7, c: 4 },
          { r: 7, c: 5 },
          // Top-right continuous wall (3 hexes)
          { r: 7, c: 9 },
          { r: 7, c: 10 },
          { r: 7, c: 11 },
          // Upper center bunker (4 continuous hexes)
          { r: 9, c: 7 },
          { r: 10, c: 6 },
          { r: 10, c: 7 },
          { r: 10, c: 8 },
          // Lower center bunker (4 continuous hexes)
          { r: 14, c: 6 },
          { r: 14, c: 7 },
          { r: 14, c: 8 },
          { r: 15, c: 7 },
          // Bottom-left continuous wall (3 hexes)
          { r: 17, c: 3 },
          { r: 17, c: 4 },
          { r: 17, c: 5 },
          // Bottom-right continuous wall (3 hexes)
          { r: 17, c: 9 },
          { r: 17, c: 10 },
          { r: 17, c: 11 },
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Level 6',
    title: 'Citadel Maze',
    description: 'Hard AI (Minimax) • 28 Obstacle Blocks',
    difficulty: 'hard',
    dots: {
      dot1: 'classic',
      dot2: 'classic',
      dot3: 'classic',
      dot4: 'classic',
    },
    pos_power: [
      {
        type: 'BLACK_BOX',
        coordinates: [
          // Top-left fortress cluster (4 continuous hexes)
          { r: 6, c: 3 },
          { r: 6, c: 4 },
          { r: 7, c: 3 },
          { r: 7, c: 4 },
          // Top-right fortress cluster (4 continuous hexes)
          { r: 6, c: 10 },
          { r: 6, c: 11 },
          { r: 7, c: 10 },
          { r: 7, c: 11 },
          // Center gate bastion towers (4 hexes)
          { r: 11, c: 6 },
          { r: 11, c: 8 },
          { r: 13, c: 6 },
          { r: 13, c: 8 },
          // Central citadel rampart wall (8 hexes)
          { r: 12, c: 1 },
          { r: 12, c: 2 },
          { r: 12, c: 5 },
          { r: 12, c: 6 },
          { r: 12, c: 8 },
          { r: 12, c: 9 },
          { r: 12, c: 12 },
          { r: 12, c: 13 },
          // Bottom-left fortress cluster (4 continuous hexes)
          { r: 17, c: 3 },
          { r: 17, c: 4 },
          { r: 18, c: 3 },
          { r: 18, c: 4 },
          // Bottom-right fortress cluster (4 continuous hexes)
          { r: 17, c: 10 },
          { r: 17, c: 11 },
          { r: 18, c: 10 },
          { r: 18, c: 11 },
        ],
      },
    ],
  },
];

export function getPlayerLoadoutForLevel(level: LevelConfig): [CharacterId, CharacterId, CharacterId, CharacterId] {
  return [level.dots.dot1, level.dots.dot2, level.dots.dot3, level.dots.dot4];
}

export function getBotLoadoutForLevel(level: LevelConfig): [CharacterId, CharacterId, CharacterId, CharacterId] {
  if (level.botDots) {
    return [level.botDots.dot1, level.botDots.dot2, level.botDots.dot3, level.botDots.dot4];
  }
  return getPlayerLoadoutForLevel(level);
}

export function getBlackBoxesForLevel(level: LevelConfig): Point[] {
  if (!level.pos_power) return [];
  if (Array.isArray(level.pos_power)) {
    const item = level.pos_power.find(
      (p) => (p.type && p.type.toUpperCase() === 'BLACK_BOX')
    );
    return item?.coordinates ?? [];
  }
  return level.pos_power.BLACK_BOX ?? [];
}

export function getLevelById(id: number): LevelConfig {
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}

/** Backward compatibility alias */
export const AI_LEVELS = LEVELS.map((l) => ({
  id: l.difficulty,
  name: `${l.name}: ${l.title}`,
  level: l.id,
  description: l.description,
}));
