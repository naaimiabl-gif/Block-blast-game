import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActiveShape } from '../types';
import { Shape } from './Shape';

interface ShapePanelProps {
  shapes: ActiveShape[];
  onDragStart?: (shapeId: string) => void;
  onDragMove?: (shapeId: string, x: number, y: number) => void;
  onDragEnd?: (shapeId: string, x: number, y: number) => void;
  onDrop?: (shapeId: string, x: number, y: number) => void;
}

export const ShapePanel: React.FC<ShapePanelProps> = ({
  shapes,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDrop,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.shapesRow}>
        {shapes.map((shape) => (
          <View key={shape.id} style={styles.shapeWrapper}>
            <Shape
              shape={shape}
              onDragStart={() => onDragStart?.(shape.id)}
              onDragMove={(x, y) => onDragMove?.(shape.id, x, y)}
              onDragEnd={(x, y) => onDragEnd?.(shape.id, x, y)}
              onDrop={(x, y) => onDrop?.(shape.id, x, y)}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  shapesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 120,
  },
  shapeWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
});
