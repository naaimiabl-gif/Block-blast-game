import { ShapeDefinition } from '../types';

export const SHAPE_DEFINITIONS: Record<string, ShapeDefinition> = {
  // Grote shapes
  L_SHAPE: {
    blocks: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
    ],
    rotations: 4,
  },
  L_SHAPE_REVERSE: {
    blocks: [
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 2, col: 1 },
      { row: 2, col: 0 },
    ],
    rotations: 4,
  },
  T_SHAPE: {
    blocks: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 1 },
    ],
    rotations: 4,
  },
  S_SHAPE: {
    blocks: [
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    rotations: 2,
  },
  Z_SHAPE: {
    blocks: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ],
    rotations: 2,
  },

  // Medium shapes
  LINE_3: {
    blocks: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
    ],
    rotations: 2,
  },
  LINE_4: {
    blocks: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
    ],
    rotations: 2,
  },
  LINE_5: {
    blocks: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 2, col: 0 },
      { row: 3, col: 0 },
      { row: 4, col: 0 },
    ],
    rotations: 2,
  },
  SQUARE_2X2: {
    blocks: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    rotations: 1,
  },
  SQUARE_3X3: {
    blocks: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ],
    rotations: 1,
  },
  SMALL_L: {
    blocks: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ],
    rotations: 4,
  },

  // Kleine shapes
  SINGLE: {
    blocks: [{ row: 0, col: 0 }],
    rotations: 1,
  },
  LINE_2: {
    blocks: [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
    ],
    rotations: 2,
  },
  CORNER: {
    blocks: [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 0 },
    ],
    rotations: 4,
  },
};

export const SHAPE_WEIGHTS: Record<string, number> = {
  SINGLE: 10,
  LINE_2: 15,
  LINE_3: 15,
  CORNER: 12,
  SMALL_L: 12,
  SQUARE_2X2: 10,
  L_SHAPE: 8,
  L_SHAPE_REVERSE: 8,
  T_SHAPE: 6,
  S_SHAPE: 5,
  Z_SHAPE: 5,
  LINE_4: 4,
  LINE_5: 2,
  SQUARE_3X3: 2,
};
