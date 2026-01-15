import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Cell as CellType } from '../types';
import { GRID_COLORS } from '../constants';

interface CellProps {
  cell: CellType | null;
  size: number;
  isPreview?: boolean;
  canPlace?: boolean;
}

export const Cell: React.FC<CellProps> = ({
  cell,
  size,
  isPreview = false,
  canPlace = true,
}) => {
  const cellStyle = {
    width: size,
    height: size,
    backgroundColor: cell
      ? cell.color
      : isPreview
      ? canPlace
        ? 'rgba(78, 205, 196, 0.4)'
        : 'rgba(255, 107, 107, 0.4)'
      : GRID_COLORS.cellEmpty,
    borderWidth: 1,
    borderColor: GRID_COLORS.cellBorder,
    borderRadius: 4,
  };

  return (
    <View style={[styles.cell, cellStyle]}>
      {cell?.diamond && <View style={styles.diamond} />}
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamond: {
    width: '40%',
    height: '40%',
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
