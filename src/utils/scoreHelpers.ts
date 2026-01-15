import { Cell } from '../types';
import { BALANCE_CONFIG, getStreakMultiplier } from '../constants';

export const calculateScore = (
  clearedBlocks: Cell[],
  streak: number
): number => {
  let score = 0;
  let diamondCount = 0;

  clearedBlocks.forEach((block) => {
    if (block.diamond) {
      score += BALANCE_CONFIG.DIAMOND_POINTS;
      diamondCount++;
    } else {
      score += BALANCE_CONFIG.NORMAL_POINTS;
    }
  });

  // Check for full diamond row (8 diamonds in a row/col)
  if (diamondCount === BALANCE_CONFIG.GRID_SIZE) {
    score += BALANCE_CONFIG.FULL_DIAMOND_ROW_BONUS;
  }

  const multiplier = getStreakMultiplier(streak);
  return score * multiplier;
};
