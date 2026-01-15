import { useState, useCallback } from 'react';
import { GameState, Grid, ActiveShape, Block } from '../types';
import {
  createEmptyGrid,
  canPlaceShape,
  placeShape,
  checkAndClear,
  isGameOver,
} from '../utils/gridHelpers';
import { generateShapes } from '../utils/shapeHelpers';
import { calculateScore } from '../utils/scoreHelpers';
import { BALANCE_CONFIG } from '../constants';

const createInitialState = (): GameState => ({
  grid: createEmptyGrid(),
  availableShapes: generateShapes(BALANCE_CONFIG.SHAPES_PER_ROUND),
  shapesPlacedThisRound: 0,
  clearedThisRound: false,
  score: 0,
  streak: 0,
  highScore: 0,
  rotateTokens: 0,
  isGameOver: false,
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState);

  const canPlace = useCallback(
    (blocks: Block[], targetRow: number, targetCol: number): boolean => {
      return canPlaceShape(gameState.grid, blocks, targetRow, targetCol);
    },
    [gameState.grid]
  );

  const placeShapeOnGrid = useCallback(
    (shapeId: string, targetRow: number, targetCol: number) => {
      setGameState((prevState) => {
        const shapeIndex = prevState.availableShapes.findIndex(
          (s) => s.id === shapeId
        );
        if (shapeIndex === -1) return prevState;

        const shape = prevState.availableShapes[shapeIndex];

        // Check if placement is valid
        if (!canPlaceShape(prevState.grid, shape.blocks, targetRow, targetCol)) {
          return prevState;
        }

        // Place the shape
        let newGrid = placeShape(
          prevState.grid,
          shape.blocks,
          targetRow,
          targetCol,
          shape.color,
          shape.diamondIndex
        );

        // Check for clears
        const clearResult = checkAndClear(newGrid);
        newGrid = clearResult.grid;

        // Calculate score
        const newScore =
          prevState.score +
          calculateScore(clearResult.clearedBlocks, prevState.streak);

        // Update streak
        let newStreak = prevState.streak;
        let newClearedThisRound = prevState.clearedThisRound;
        let newShapesPlacedThisRound = prevState.shapesPlacedThisRound + 1;

        if (clearResult.clearedCount > 0) {
          newStreak += clearResult.clearedCount;
          newClearedThisRound = true;
          // Reset round tracking on clear
          newShapesPlacedThisRound = 0;
          newClearedThisRound = false;
        }

        // Remove placed shape from available shapes
        const newAvailableShapes = prevState.availableShapes.filter(
          (s) => s.id !== shapeId
        );

        // Check if we need new shapes (all 3 placed) or if round complete
        let finalAvailableShapes = newAvailableShapes;
        let finalShapesPlaced = newShapesPlacedThisRound;
        let finalClearedThisRound = newClearedThisRound;
        let finalStreak = newStreak;

        if (newAvailableShapes.length === 0) {
          // All 3 shapes placed - check if we cleared this round
          if (!newClearedThisRound && clearResult.clearedCount === 0) {
            // No clear this round - reset streak
            finalStreak = 0;
          }
          // Generate new shapes
          finalAvailableShapes = generateShapes(BALANCE_CONFIG.SHAPES_PER_ROUND);
          finalShapesPlaced = 0;
          finalClearedThisRound = false;
        }

        // Check for game over
        const gameOver = isGameOver(newGrid, finalAvailableShapes);

        // Update high score
        const newHighScore = Math.max(prevState.highScore, newScore);

        return {
          ...prevState,
          grid: newGrid,
          availableShapes: finalAvailableShapes,
          shapesPlacedThisRound: finalShapesPlaced,
          clearedThisRound: finalClearedThisRound,
          score: newScore,
          streak: finalStreak,
          highScore: newHighScore,
          isGameOver: gameOver,
        };
      });
    },
    []
  );

  const resetGame = useCallback(() => {
    setGameState((prevState) => ({
      ...createInitialState(),
      highScore: prevState.highScore,
    }));
  }, []);

  return {
    gameState,
    canPlace,
    placeShapeOnGrid,
    resetGame,
  };
};
