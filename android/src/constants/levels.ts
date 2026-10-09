import { CharacterId, Point, ZoneTrapCell } from '../types/game';
import { DEFAULT_ZONE_TRAP_COLOR, LevelBoardObstacles } from '../engine/boardObstacleEngine';

const CITADEL_BLACK_BOXES: Point[] = [
  { r: 6, c: 3 },
  { r: 6, c: 4 },
  { r: 7, c: 3 },
  { r: 7, c: 4 },
  { r: 6, c: 10 },
  { r: 6, c: 11 },
  { r: 7, c: 10 },
  { r: 7, c: 11 },
  { r: 11, c: 6 },
  { r: 11, c: 8 },
  { r: 13, c: 6 },
  { r: 13, c: 8 },
  { r: 12, c: 1 },
  { r: 12, c: 2 },
  { r: 12, c: 5 },
  { r: 12, c: 6 },
  { r: 12, c: 8 },
  { r: 12, c: 9 },
  { r: 12, c: 12 },
  { r: 12, c: 13 },
  { r: 17, c: 3 },
  { r: 17, c: 4 },
  { r: 18, c: 3 },
  { r: 18, c: 4 },
  { r: 17, c: 10 },
  { r: 17, c: 11 },
  { r: 18, c: 10 },
  { r: 18, c: 11 },
];

const LEVEL4_BLACK_BOXES: Point[] = [
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
];

const LEVEL5_BLACK_BOXES: Point[] = [
  { r: 7, c: 3 },
  { r: 7, c: 4 },
  { r: 7, c: 5 },
  { r: 7, c: 9 },
  { r: 7, c: 10 },
  { r: 7, c: 11 },
  { r: 9, c: 7 },
  { r: 10, c: 6 },
  { r: 10, c: 7 },
  { r: 10, c: 8 },
  { r: 14, c: 6 },
  { r: 14, c: 7 },
  { r: 14, c: 8 },
  { r: 15, c: 7 },
  { r: 17, c: 3 },
  { r: 17, c: 4 },
  { r: 17, c: 5 },
  { r: 17, c: 9 },
  { r: 17, c: 10 },
  { r: 17, c: 11 },
];

const LEVEL7_BLACK_BOXES: Point[] = [
  // 4 corner bunker fortresses (4 hexes each = 16 hexes)
  { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 4 },
  { r: 7, c: 10 }, { r: 7, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 11 },
  { r: 16, c: 3 }, { r: 16, c: 4 }, { r: 17, c: 3 }, { r: 17, c: 4 },
  { r: 16, c: 10 }, { r: 16, c: 11 }, { r: 17, c: 10 }, { r: 17, c: 11 },
];

const LEVEL7_PROXIMITY_TRAPS: Point[] = [
  // Center diamond snare ring (4 hexes)
  { r: 11, c: 7 },
  { r: 12, c: 6 },
  { r: 12, c: 8 },
  { r: 13, c: 7 },
];

const LEVEL8_BLACK_BOXES: Point[] = [
  // Left canal wall (6 hexes)
  { r: 8, c: 4 }, { r: 9, c: 4 }, { r: 10, c: 4 },
  { r: 14, c: 4 }, { r: 15, c: 4 }, { r: 16, c: 4 },
  // Right canal wall (6 hexes)
  { r: 8, c: 10 }, { r: 9, c: 10 }, { r: 10, c: 10 },
  { r: 14, c: 10 }, { r: 15, c: 10 }, { r: 16, c: 10 },
  // Center towers (2 hexes)
  { r: 9, c: 7 }, { r: 15, c: 7 },
  // Flank bastions (4 hexes)
  { r: 12, c: 1 }, { r: 12, c: 2 }, { r: 12, c: 12 }, { r: 12, c: 13 },
];

const LEVEL8_PROXIMITY_TRAPS: Point[] = [
  // Midfield transit chokes (4 hexes)
  { r: 11, c: 6 }, { r: 11, c: 8 },
  { r: 13, c: 6 }, { r: 13, c: 8 },
  // Canal snares (2 hexes)
  { r: 12, c: 4 }, { r: 12, c: 10 },
];

const LEVEL9_BLACK_BOXES: Point[] = [
  // Outer corner angles (3 * 4 = 12 hexes)
  { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 7, c: 2 },
  { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 7, c: 12 },
  { r: 17, c: 2 }, { r: 18, c: 2 }, { r: 18, c: 3 },
  { r: 17, c: 12 }, { r: 18, c: 11 }, { r: 18, c: 12 },
  // Midfield pillars (4 hexes)
  { r: 10, c: 5 }, { r: 10, c: 9 },
  { r: 14, c: 5 }, { r: 14, c: 9 },
  // Center barrier (3 hexes)
  { r: 12, c: 6 }, { r: 12, c: 7 }, { r: 12, c: 8 },
  // Perimeter bastions (2 hexes)
  { r: 12, c: 0 }, { r: 12, c: 14 },
];

const LEVEL9_PROXIMITY_TRAPS: Point[] = [
  // Approach gate snares (4 hexes)
  { r: 8, c: 5 }, { r: 8, c: 9 },
  { r: 16, c: 5 }, { r: 16, c: 9 },
  // Flank gate snares (4 hexes)
  { r: 11, c: 3 }, { r: 11, c: 11 },
  { r: 13, c: 3 }, { r: 13, c: 11 },
];

const LEVEL10_BLACK_BOXES: Point[] = [
  // Row 7 staggered barrier (6 hexes)
  { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 },
  { r: 7, c: 8 }, { r: 7, c: 9 }, { r: 7, c: 10 },
  // Row 17 staggered barrier (6 hexes)
  { r: 17, c: 4 }, { r: 17, c: 5 }, { r: 17, c: 6 },
  { r: 17, c: 8 }, { r: 17, c: 9 }, { r: 17, c: 10 },
  // Center barricades (6 hexes)
  { r: 12, c: 2 }, { r: 12, c: 3 }, { r: 12, c: 5 },
  { r: 12, c: 9 }, { r: 12, c: 11 }, { r: 12, c: 12 },
  // Flank pillars (4 hexes)
  { r: 10, c: 1 }, { r: 14, c: 1 },
  { r: 10, c: 13 }, { r: 14, c: 13 },
];

const LEVEL10_PROXIMITY_TRAPS: Point[] = [
  // Upper snare trio (3 hexes)
  { r: 9, c: 6 }, { r: 9, c: 7 }, { r: 9, c: 8 },
  // Lower snare trio (3 hexes)
  { r: 15, c: 6 }, { r: 15, c: 7 }, { r: 15, c: 8 },
  // Flank corridor snares (4 hexes)
  { r: 11, c: 4 }, { r: 11, c: 10 },
  { r: 13, c: 4 }, { r: 13, c: 10 },
];

const LEVEL11_BLACK_BOXES: Point[] = [
  // 4 diagonal wings (3 * 4 = 12 hexes)
  { r: 6, c: 3 }, { r: 7, c: 4 }, { r: 8, c: 5 },
  { r: 6, c: 11 }, { r: 7, c: 10 }, { r: 8, c: 9 },
  { r: 18, c: 3 }, { r: 17, c: 4 }, { r: 16, c: 5 },
  { r: 18, c: 11 }, { r: 17, c: 10 }, { r: 16, c: 9 },
  // Center hub fortress (6 hexes)
  { r: 11, c: 7 }, { r: 13, c: 7 },
  { r: 12, c: 3 }, { r: 12, c: 4 }, { r: 12, c: 10 }, { r: 12, c: 11 },
  // Perimeter guard blocks (8 hexes)
  { r: 9, c: 2 }, { r: 10, c: 2 }, { r: 14, c: 2 }, { r: 15, c: 2 },
  { r: 9, c: 12 }, { r: 10, c: 12 }, { r: 14, c: 12 }, { r: 15, c: 12 },
];

const LEVEL11_PROXIMITY_TRAPS: Point[] = [
  // Center hub cross (2 hexes)
  { r: 12, c: 6 }, { r: 12, c: 8 },
  // Inner gates (4 hexes)
  { r: 10, c: 5 }, { r: 10, c: 9 },
  { r: 14, c: 5 }, { r: 14, c: 9 },
  // Outer flank snares (4 hexes)
  { r: 11, c: 1 }, { r: 13, c: 1 },
  { r: 11, c: 13 }, { r: 13, c: 13 },
  // Center poles (2 hexes)
  { r: 9, c: 7 }, { r: 15, c: 7 },
];

const LEVEL12_BLACK_BOXES: Point[] = [
  // 4 corner redoubts (4 * 4 = 16 hexes)
  { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 7, c: 3 }, { r: 7, c: 4 },
  { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 11 },
  { r: 17, c: 3 }, { r: 17, c: 4 }, { r: 18, c: 3 }, { r: 18, c: 4 },
  { r: 17, c: 10 }, { r: 17, c: 11 }, { r: 18, c: 10 }, { r: 18, c: 11 },
  // Central rampart wall (8 hexes)
  { r: 12, c: 1 }, { r: 12, c: 2 }, { r: 12, c: 5 }, { r: 12, c: 6 },
  { r: 12, c: 8 }, { r: 12, c: 9 }, { r: 12, c: 12 }, { r: 12, c: 13 },
  // Center bastion towers (4 hexes)
  { r: 10, c: 7 }, { r: 14, c: 7 },
  { r: 11, c: 6 }, { r: 13, c: 8 },
  // Perimeter flank locks (2 hexes)
  { r: 12, c: 0 }, { r: 12, c: 14 },
];

const LEVEL12_PROXIMITY_TRAPS: Point[] = [
  // Gate choke pairs (4 hexes)
  { r: 11, c: 8 }, { r: 13, c: 6 },
  { r: 11, c: 7 }, { r: 13, c: 7 },
  // Rampart flank snares (2 hexes)
  { r: 12, c: 4 }, { r: 12, c: 10 },
  // Corner redoubt pinchers (8 hexes)
  { r: 8, c: 3 }, { r: 8, c: 4 }, { r: 8, c: 10 }, { r: 8, c: 11 },
  { r: 16, c: 3 }, { r: 16, c: 4 }, { r: 16, c: 10 }, { r: 16, c: 11 },
  // Midfield watch posts (2 hexes)
  { r: 9, c: 7 }, { r: 15, c: 7 },
];

export interface PosPowerItem {
  type: string;
  coordinates: Point[];
  /** Required for ZONE_TRAP families that share a kill color. */
  color?: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /**
   * Declarative bot thinking/action delay in milliseconds.
   * Levels 1 & 2 use the standard 800ms delay.
   * Level 3 onwards use faster custom delays (e.g. 150ms) for fast and snappy pacing.
   */
  botDelayMs?: number;
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
   * Board obstacles: BLACK_BOX (impassable), PROXIMITY_TRAP (impassable + pinch kill),
   * ZONE_TRAP (passable + occupancy kill).
   * Array form: [{ type: 'BLACK_BOX', coordinates: [...] }, ...]
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
    botDelayMs: 800,
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
    botDelayMs: 800,
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
    botDelayMs: 150,
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
    botDelayMs: 150,
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
    botDelayMs: 150,
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
    botDelayMs: 150,
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
  {
    id: 7,
    name: 'Level 7',
    title: 'The Crossfire',
    description: 'Hard AI • 16 Bunker Blocks • 4 Central Snares',
    difficulty: 'hard',
    botDelayMs: 150,
    dots: {
      dot1: 'classic',
      dot2: 'classic',
      dot3: 'bulwark',
      dot4: 'classic',
    },
    pos_power: [
      { type: 'BLACK_BOX', coordinates: LEVEL7_BLACK_BOXES },
      { type: 'PROXIMITY_TRAP', coordinates: LEVEL7_PROXIMITY_TRAPS },
    ],
  },
  {
    id: 8,
    name: 'Level 8',
    title: 'Twin Corridors',
    description: 'Hard AI • 18 Canal Blocks • 6 Transit Snares',
    difficulty: 'hard',
    botDelayMs: 150,
    dots: {
      dot1: 'classic',
      dot2: 'nova',
      dot3: 'classic',
      dot4: 'bulwark',
    },
    pos_power: [
      { type: 'BLACK_BOX', coordinates: LEVEL8_BLACK_BOXES },
      { type: 'PROXIMITY_TRAP', coordinates: LEVEL8_PROXIMITY_TRAPS },
    ],
  },
  {
    id: 9,
    name: 'Level 9',
    title: 'Fortress Rings',
    description: 'Hard AI • 21 Fortress Blocks • 8 Gate Snares',
    difficulty: 'hard',
    botDelayMs: 150,
    dots: {
      dot1: 'classic',
      dot2: 'bulwark',
      dot3: 'reaper',
      dot4: 'classic',
    },
    pos_power: [
      { type: 'BLACK_BOX', coordinates: LEVEL9_BLACK_BOXES },
      { type: 'PROXIMITY_TRAP', coordinates: LEVEL9_PROXIMITY_TRAPS },
    ],
  },
  {
    id: 10,
    name: 'Level 10',
    title: 'The Gauntlet',
    description: 'Hard AI • 22 Gauntlet Blocks • 10 Clustered Snares',
    difficulty: 'hard',
    botDelayMs: 150,
    dots: {
      dot1: 'classic',
      dot2: 'nova',
      dot3: 'reaper',
      dot4: 'classic',
    },
    pos_power: [
      { type: 'BLACK_BOX', coordinates: LEVEL10_BLACK_BOXES },
      { type: 'PROXIMITY_TRAP', coordinates: LEVEL10_PROXIMITY_TRAPS },
    ],
  },
  {
    id: 11,
    name: 'Level 11',
    title: 'Spiderweb Labyrinth',
    description: 'Hard AI • 26 Labyrinth Blocks • 12 Web Snares',
    difficulty: 'hard',
    botDelayMs: 150,
    dots: {
      dot1: 'bulwark',
      dot2: 'nova',
      dot3: 'classic',
      dot4: 'reaper',
    },
    pos_power: [
      { type: 'BLACK_BOX', coordinates: LEVEL11_BLACK_BOXES },
      { type: 'PROXIMITY_TRAP', coordinates: LEVEL11_PROXIMITY_TRAPS },
    ],
  },
  {
    id: 12,
    name: 'Level 12',
    title: 'Grand Citadel',
    description: 'Hard AI • 30 Citadel Blocks • 16 Lethal Snares',
    difficulty: 'hard',
    botDelayMs: 150,
    dots: {
      dot1: 'reaper',
      dot2: 'bulwark',
      dot3: 'nova',
      dot4: 'classic',
    },
    pos_power: [
      { type: 'BLACK_BOX', coordinates: LEVEL12_BLACK_BOXES },
      { type: 'PROXIMITY_TRAP', coordinates: LEVEL12_PROXIMITY_TRAPS },
    ],
  },
];

export function getBotDelayForLevel(level: LevelConfig): number {
  return level.botDelayMs ?? 800;
}

export function getPlayerLoadoutForLevel(level: LevelConfig): [CharacterId, CharacterId, CharacterId, CharacterId] {
  return [level.dots.dot1, level.dots.dot2, level.dots.dot3, level.dots.dot4];
}

export function getBotLoadoutForLevel(level: LevelConfig): [CharacterId, CharacterId, CharacterId, CharacterId] {
  if (level.botDots) {
    return [level.botDots.dot1, level.botDots.dot2, level.botDots.dot3, level.botDots.dot4];
  }
  return getPlayerLoadoutForLevel(level);
}

function getCoordinatesForPowerType(level: LevelConfig, type: string): Point[] {
  if (!level.pos_power) return [];
  const normalized = type.toUpperCase();
  if (Array.isArray(level.pos_power)) {
    return level.pos_power
      .filter((p) => p.type && p.type.toUpperCase() === normalized)
      .flatMap((p) => p.coordinates ?? []);
  }
  const record = level.pos_power as Record<string, Point[] | undefined>;
  return record[type] ?? record[normalized] ?? [];
}

function getZoneTrapsForLevel(level: LevelConfig): ZoneTrapCell[] {
  if (!level.pos_power) return [];
  if (Array.isArray(level.pos_power)) {
    const cells: ZoneTrapCell[] = [];
    for (const item of level.pos_power) {
      if (!item.type || item.type.toUpperCase() !== 'ZONE_TRAP') continue;
      const color = item.color ?? DEFAULT_ZONE_TRAP_COLOR;
      for (const point of item.coordinates ?? []) {
        cells.push({ point, color });
      }
    }
    return cells;
  }
  const record = level.pos_power as { ZONE_TRAP?: Point[] };
  return (record.ZONE_TRAP ?? []).map((point) => ({
    point,
    color: DEFAULT_ZONE_TRAP_COLOR,
  }));
}

export function getBoardObstaclesForLevel(level: LevelConfig): LevelBoardObstacles {
  return {
    blackBoxes: getCoordinatesForPowerType(level, 'BLACK_BOX'),
    proximityTraps: getCoordinatesForPowerType(level, 'PROXIMITY_TRAP'),
    zoneTraps: getZoneTrapsForLevel(level),
  };
}

export function getBlackBoxesForLevel(level: LevelConfig): Point[] {
  return getBoardObstaclesForLevel(level).blackBoxes;
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
