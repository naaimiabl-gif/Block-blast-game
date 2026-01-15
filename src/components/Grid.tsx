import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Grid as GridType, Block } from '../types';
import { Cell } from './Cell';
import { GRID_COLORS, BALANCE_CONFIG } from '../constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 20;
const GRID_SIZE = SCREEN_WIDTH - GRID_PADDING * 2;
const CELL_SIZE = Math.floor(GRID_SIZE / BALANCE_CONFIG.GRID_SIZE) - 2;

interface GridProps {
  grid: GridType;
  previewBlocks?: Block[];
  previewPosition?: { row: number; col: number };
  canPlacePreview?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  previewBlocks,
  previewPosition,
  canPlacePreview = true,
}) => {
  const isPreviewCell = (row: number, col: number): boolean => {
    if (!previewBlocks || !previewPosition) return false;
    return previewBlocks.some(
      (block) =>
        previewPosition.row + block.row === row &&
        previewPosition.col + block.col === col
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                size={CELL_SIZE}
                isPreview={!cell && isPreviewCell(rowIndex, colIndex)}
                canPlace={canPlacePreview}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export const getGridLayout = () => ({
  gridSize: GRID_SIZE,
  cellSize: CELL_SIZE,
  padding: GRID_PADDING,
});

const styles = StyleSheet.create({
  container: {
    padding: GRID_PADDING,
    alignItems: 'center',
  },
  grid: {
    backgroundColor: GRID_COLORS.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: GRID_COLORS.gridBorder,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
  },
});
