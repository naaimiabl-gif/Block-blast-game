import { Block, ActiveShape } from '../types';
import { SHAPE_DEFINITIONS, SHAPE_WEIGHTS, BLOCK_COLORS, BALANCE_CONFIG } from '../constants';

const randomChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const weightedRandomChoice = (weights: Record<string, number>): string => {
  const entries = Object.entries(weights);
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return key;
    }
  }

  return entries[0][0];
};

export const rotateBlocks = (blocks: Block[]): Block[] => {
  // Rotate 90 degrees clockwise
  const rotated = blocks.map((block) => ({
    row: block.col,
    col: -block.row,
  }));

  // Normalize so minimum row/col = 0
  const minRow = Math.min(...rotated.map((b) => b.row));
  const minCol = Math.min(...rotated.map((b) => b.col));

  return rotated.map((block) => ({
    row: block.row - minRow,
    col: block.col - minCol,
  }));
};

export const generateShape = (): ActiveShape => {
  const type = weightedRandomChoice(SHAPE_WEIGHTS);
  const definition = SHAPE_DEFINITIONS[type];
  const color = randomChoice(BLOCK_COLORS);

  // Diamond chance: ~1 in 8 shapes
  const hasDiamond = Math.random() < BALANCE_CONFIG.DIAMOND_CHANCE;
  const diamondIndex = hasDiamond
    ? Math.floor(Math.random() * definition.blocks.length)
    : null;

  return {
    id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    color,
    blocks: [...definition.blocks],
    currentRotation: 0,
    hasDiamond,
    diamondIndex,
  };
};

export const generateShapes = (count: number = 3): ActiveShape[] => {
  return Array(count)
    .fill(null)
    .map(() => generateShape());
};

export const getShapeBounds = (blocks: Block[]): { width: number; height: number } => {
  const maxRow = Math.max(...blocks.map((b) => b.row));
  const maxCol = Math.max(...blocks.map((b) => b.col));

  return {
    width: maxCol + 1,
    height: maxRow + 1,
  };
};
