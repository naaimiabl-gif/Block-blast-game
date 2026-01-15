import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Grid, getGridLayout } from './Grid';
import { ShapePanel } from './ShapePanel';
import { ScoreDisplay } from './ScoreDisplay';
import { GameOverModal } from './GameOverModal';
import { useGameState } from '../hooks';
import { Block } from '../types';
import { UI_COLORS, BALANCE_CONFIG } from '../constants';
import { canPlaceShape } from '../utils';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const Game: React.FC = () => {
  const { gameState, placeShapeOnGrid, resetGame, canPlace } = useGameState();
  const [draggingShapeId, setDraggingShapeId] = useState<string | null>(null);
  const [previewPosition, setPreviewPosition] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [previewBlocks, setPreviewBlocks] = useState<Block[] | null>(null);
  const [canPlacePreview, setCanPlacePreview] = useState(true);

  const gridRef = useRef<View>(null);
  const [gridLayout, setGridLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const onGridLayout = useCallback(() => {
    gridRef.current?.measureInWindow((x, y, width, height) => {
      setGridLayout({ x, y, width, height });
    });
  }, []);

  const screenToGrid = useCallback(
    (screenX: number, screenY: number): { row: number; col: number } | null => {
      if (!gridLayout) return null;

      const { gridSize, cellSize, padding } = getGridLayout();
      const gridStartX = gridLayout.x + padding + 6; // Account for border and padding
      const gridStartY = gridLayout.y + padding + 6;

      const col = Math.floor((screenX - gridStartX) / cellSize);
      const row = Math.floor((screenY - gridStartY) / cellSize);

      if (
        row < 0 ||
        row >= BALANCE_CONFIG.GRID_SIZE ||
        col < 0 ||
        col >= BALANCE_CONFIG.GRID_SIZE
      ) {
        return null;
      }

      return { row, col };
    },
    [gridLayout]
  );

  const handleDragStart = useCallback((shapeId: string) => {
    setDraggingShapeId(shapeId);
  }, []);

  const handleDragMove = useCallback(
    (shapeId: string, x: number, y: number) => {
      const shape = gameState.availableShapes.find((s) => s.id === shapeId);
      if (!shape) return;

      const gridPos = screenToGrid(x, y);

      if (gridPos) {
        setPreviewPosition(gridPos);
        setPreviewBlocks(shape.blocks);
        const canPlaceHere = canPlace(shape.blocks, gridPos.row, gridPos.col);
        setCanPlacePreview(canPlaceHere);
      } else {
        setPreviewPosition(null);
        setPreviewBlocks(null);
      }
    },
    [gameState.availableShapes, screenToGrid, canPlace]
  );

  const handleDrop = useCallback(
    (shapeId: string, x: number, y: number) => {
      const shape = gameState.availableShapes.find((s) => s.id === shapeId);
      if (!shape) return;

      const gridPos = screenToGrid(x, y);

      if (gridPos && canPlace(shape.blocks, gridPos.row, gridPos.col)) {
        placeShapeOnGrid(shapeId, gridPos.row, gridPos.col);
      }

      setDraggingShapeId(null);
      setPreviewPosition(null);
      setPreviewBlocks(null);
    },
    [gameState.availableShapes, screenToGrid, canPlace, placeShapeOnGrid]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingShapeId(null);
    setPreviewPosition(null);
    setPreviewBlocks(null);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.gameContainer}>
        <ScoreDisplay
          score={gameState.score}
          highScore={gameState.highScore}
          streak={gameState.streak}
        />

        <View ref={gridRef} onLayout={onGridLayout}>
          <Grid
            grid={gameState.grid}
            previewBlocks={previewBlocks ?? undefined}
            previewPosition={previewPosition ?? undefined}
            canPlacePreview={canPlacePreview}
          />
        </View>

        <ShapePanel
          shapes={gameState.availableShapes}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        />

        <GameOverModal
          visible={gameState.isGameOver}
          score={gameState.score}
          highScore={gameState.highScore}
          onRestart={resetGame}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
  },
});
