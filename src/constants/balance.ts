export const BALANCE_CONFIG = {
  // Grid
  GRID_SIZE: 8,

  // Shapes per ronde
  SHAPES_PER_ROUND: 3,

  // Streak thresholds
  STREAK_TOKEN_THRESHOLD: 20,
  MAX_TOKENS: 3,

  // Streak multipliers
  STREAK_MULTIPLIERS: {
    0: 1,
    10: 2,
    20: 3,
    30: 4,
    40: 5,
    50: 6,
  } as Record<number, number>,

  // Diamond settings
  DIAMOND_CHANCE: 0.12,
  DIAMOND_POINTS: 50,
  NORMAL_POINTS: 10,
  FULL_DIAMOND_ROW_BONUS: 500,
};

export const getStreakMultiplier = (streak: number): number => {
  if (streak >= 50) return 6;
  if (streak >= 40) return 5;
  if (streak >= 30) return 4;
  if (streak >= 20) return 3;
  if (streak >= 10) return 2;
  return 1;
};
