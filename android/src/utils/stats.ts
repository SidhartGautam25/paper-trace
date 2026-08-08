const isWeb = typeof window !== 'undefined' && window.localStorage;

export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
}

let memoryStats: GameStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
};

export const getStats = (): GameStats => {
  if (isWeb) {
    try {
      const stored = window.localStorage.getItem('paper_trace_stats');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  }
  return memoryStats;
};

export const saveStats = (stats: GameStats) => {
  if (isWeb) {
    try {
      window.localStorage.setItem('paper_trace_stats', JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  } else {
    memoryStats = stats;
  }
};

export const recordGameOutcome = (outcome: 'win' | 'loss') => {
  const current = getStats();
  const updated: GameStats = {
    gamesPlayed: current.gamesPlayed + 1,
    wins: current.wins + (outcome === 'win' ? 1 : 0),
    losses: current.losses + (outcome === 'loss' ? 1 : 0),
  };
  saveStats(updated);
};

export const resetStats = () => {
  const resetVal: GameStats = {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
  };
  saveStats(resetVal);
};
