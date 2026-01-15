import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { ActiveShape, Block } from '../types';
import { GRID_COLORS } from '../constants';
import { getShapeBounds } from '../utils/shapeHelpers';

const PREVIEW_CELL_SIZE = 28;

interface ShapeProps {
  shape: ActiveShape;
  onDragStart?: () => void;
  onDragMove?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  onDrop?: (x: number, y: number) => void;
}

export const Shape: React.FC<ShapeProps> = ({
  shape,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDrop,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  const bounds = getShapeBounds(shape.blocks);
  const shapeWidth = bounds.width * PREVIEW_CELL_SIZE;
  const shapeHeight = bounds.height * PREVIEW_CELL_SIZE;

  const gesture = Gesture.Pan()
    .onStart(() => {
      isPressed.value = true;
      scale.value = withSpring(1.1);
      if (onDragStart) {
        runOnJS(onDragStart)();
      }
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY - 100; // Offset to show above finger

      if (onDragMove) {
        runOnJS(onDragMove)(event.absoluteX, event.absoluteY - 100);
      }
    })
    .onEnd((event) => {
      isPressed.value = false;
      scale.value = withSpring(1);

      if (onDrop) {
        runOnJS(onDrop)(event.absoluteX, event.absoluteY - 100);
      }

      if (onDragEnd) {
        runOnJS(onDragEnd)(event.absoluteX, event.absoluteY - 100);
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isPressed.value ? 100 : 1,
  }));

  const renderBlock = (block: Block, index: number) => {
    const isDiamond = shape.hasDiamond && shape.diamondIndex === index;

    return (
      <View
        key={index}
        style={[
          styles.block,
          {
            backgroundColor: shape.color,
            left: block.col * PREVIEW_CELL_SIZE,
            top: block.row * PREVIEW_CELL_SIZE,
            width: PREVIEW_CELL_SIZE - 2,
            height: PREVIEW_CELL_SIZE - 2,
          },
        ]}
      >
        {isDiamond && <View style={styles.diamond} />}
      </View>
    );
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.container,
          { width: shapeWidth, height: shapeHeight },
          animatedStyle,
        ]}
      >
        {shape.blocks.map((block, index) => renderBlock(block, index))}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  block: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: GRID_COLORS.cellBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamond: {
    width: '40%',
    height: '40%',
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
  },
});
