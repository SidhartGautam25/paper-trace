export interface AIDifficultyConfig {
  id: 'easy' | 'medium' | 'hard';
  name: string;
  level: number;
  description: string;
}

export const AI_LEVELS: AIDifficultyConfig[] = [
  {
    id: 'easy',
    name: 'Level 1: Sketchy',
    level: 1,
    description: 'The bot makes random moves and drafts lines without a concrete strategy.',
  },
  {
    id: 'medium',
    name: 'Level 2: Ink Slasher',
    level: 2,
    description: 'Greedy approach. Looks for immediate cuts on player lines or direct hits on dots.',
  },
  {
    id: 'hard',
    name: 'Level 3: Blueprint Minimax',
    level: 3,
    description: 'Predicts moves ahead using minimax with alpha-beta pruning to block and cut.',
  },
];
