export interface Block {
  row: number;
  col: number;
}

export interface ShapeDefinition {
  blocks: Block[];
  rotations: number;
}

export interface ActiveShape {
  id: string;
  type: string;
  color: string;
  blocks: Block[];
  currentRotation: number;
  hasDiamond: boolean;
  diamondIndex: number | null;
}

export interface Cell {
  color: string;
  diamond: boolean;
}

export type Grid = (Cell | null)[][];

export interface GameState {
  grid: Grid;
  availableShapes: ActiveShape[];
  shapesPlacedThisRound: number;
  clearedThisRound: boolean;
  score: number;
  streak: number;
  highScore: number;
  rotateTokens: number;
  isGameOver: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface ClearResult {
  grid: Grid;
  clearedCount: number;
  clearedBlocks: Cell[];
  rowsCleared: number[];
  colsCleared: number[];
}
