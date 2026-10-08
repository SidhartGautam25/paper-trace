import { CharacterId } from '../types/game';

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
