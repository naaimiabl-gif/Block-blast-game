import { Grid, Cell, Block, ClearResult } from '../types';
import { BALANCE_CONFIG } from '../constants';

export const createEmptyGrid = (): Grid => {
  return Array(BALANCE_CONFIG.GRID_SIZE)
    .fill(null)
    .map(() => Array(BALANCE_CONFIG.GRID_SIZE).fill(null));
};

export const deepCopyGrid = (grid: Grid): Grid => {
  return grid.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
};

export const canPlaceShape = (
  grid: Grid,
  blocks: Block[],
  targetRow: number,
  targetCol: number
): boolean => {
  for (const block of blocks) {
    const row = targetRow + block.row;
    const col = targetCol + block.col;

    // Outside grid?
    if (
      row < 0 ||
      row >= BALANCE_CONFIG.GRID_SIZE ||
      col < 0 ||
      col >= BALANCE_CONFIG.GRID_SIZE
    ) {
      return false;
    }

    // Already occupied?
    if (grid[row][col] !== null) {
      return false;
    }
  }
  return true;
};

export const placeShape = (
  grid: Grid,
  blocks: Block[],
  targetRow: number,
  targetCol: number,
  color: string,
  diamondIndex: number | null
): Grid => {
  const newGrid = deepCopyGrid(grid);

  blocks.forEach((block, index) => {
    const row = targetRow + block.row;
    const col = targetCol + block.col;

    newGrid[row][col] = {
      color: color,
      diamond: index === diamondIndex,
    };
  });

  return newGrid;
};

export const checkAndClear = (grid: Grid): ClearResult => {
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  // Check rows
  for (let row = 0; row < BALANCE_CONFIG.GRID_SIZE; row++) {
    if (grid[row].every((cell) => cell !== null)) {
      rowsToClear.push(row);
    }
  }

  // Check columns
  for (let col = 0; col < BALANCE_CONFIG.GRID_SIZE; col++) {
    let full = true;
    for (let row = 0; row < BALANCE_CONFIG.GRID_SIZE; row++) {
      if (grid[row][col] === null) {
        full = false;
        break;
      }
    }
    if (full) colsToClear.push(col);
  }

  // Collect cleared blocks BEFORE clearing
  const clearedBlocks: Cell[] = [];

  rowsToClear.forEach((row) => {
    for (let col = 0; col < BALANCE_CONFIG.GRID_SIZE; col++) {
      const cell = grid[row][col];
      if (cell) clearedBlocks.push(cell);
    }
  });

  colsToClear.forEach((col) => {
    for (let row = 0; row < BALANCE_CONFIG.GRID_SIZE; row++) {
      // Avoid double counting if row AND column
      if (!rowsToClear.includes(row)) {
        const cell = grid[row][col];
        if (cell) clearedBlocks.push(cell);
      }
    }
  });

  // Clear the grid
  const newGrid = deepCopyGrid(grid);

  rowsToClear.forEach((row) => {
    for (let col = 0; col < BALANCE_CONFIG.GRID_SIZE; col++) {
      newGrid[row][col] = null;
    }
  });

  colsToClear.forEach((col) => {
    for (let row = 0; row < BALANCE_CONFIG.GRID_SIZE; row++) {
      newGrid[row][col] = null;
    }
  });

  return {
    grid: newGrid,
    clearedCount: rowsToClear.length + colsToClear.length,
    clearedBlocks,
    rowsCleared: rowsToClear,
    colsCleared: colsToClear,
  };
};

export const isGameOver = (grid: Grid, shapes: { blocks: Block[] }[]): boolean => {
  // Check if ANY of the shapes can be placed ANYWHERE
  for (const shape of shapes) {
    for (let row = 0; row < BALANCE_CONFIG.GRID_SIZE; row++) {
      for (let col = 0; col < BALANCE_CONFIG.GRID_SIZE; col++) {
        if (canPlaceShape(grid, shape.blocks, row, col)) {
          return false; // At least one move is possible
        }
      }
    }
  }
  return true; // No moves possible
};
