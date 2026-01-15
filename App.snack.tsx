import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// ============ TYPES ============
interface Block {
  row: number;
  col: number;
}

interface ActiveShape {
  id: string;
  type: string;
  color: string;
  blocks: Block[];
  hasDiamond: boolean;
  diamondIndex: number | null;
}

interface Cell {
  color: string;
  diamond: boolean;
}

type Grid = (Cell | null)[][];

interface GameState {
  grid: Grid;
  availableShapes: ActiveShape[];
  score: number;
  streak: number;
  highScore: number;
  isGameOver: boolean;
}

// ============ CONSTANTS ============
const GRID_SIZE = 8;
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 20;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2 - 20) / GRID_SIZE);

const BLOCK_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#F39C12', '#9B59B6',
];

const COLORS = {
  background: '#0f0f23',
  gridBg: '#1a1a2e',
  cellEmpty: '#16213e',
  cellBorder: '#0f3460',
  gridBorder: '#e94560',
  text: '#ffffff',
  textSecondary: '#888888',
  accent: '#e94560',
};

const SHAPE_DEFINITIONS: Record<string, Block[]> = {
  L_SHAPE: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 2, col: 1 }],
  L_REVERSE: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 2, col: 0 }],
  T_SHAPE: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }],
  S_SHAPE: [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
  Z_SHAPE: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
  LINE_3: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }],
  LINE_4: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }],
  SQUARE_2X2: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
  SMALL_L: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
  SINGLE: [{ row: 0, col: 0 }],
  LINE_2: [{ row: 0, col: 0 }, { row: 1, col: 0 }],
  CORNER: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }],
};

const SHAPE_WEIGHTS: [string, number][] = [
  ['SINGLE', 10], ['LINE_2', 15], ['LINE_3', 12], ['CORNER', 12],
  ['SMALL_L', 12], ['SQUARE_2X2', 10], ['L_SHAPE', 8], ['L_REVERSE', 8],
  ['T_SHAPE', 6], ['S_SHAPE', 5], ['Z_SHAPE', 5], ['LINE_4', 4],
];

// ============ UTILS ============
const createEmptyGrid = (): Grid =>
  Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

const deepCopyGrid = (grid: Grid): Grid =>
  grid.map(row => row.map(cell => cell ? { ...cell } : null));

const canPlaceShape = (grid: Grid, blocks: Block[], targetRow: number, targetCol: number): boolean => {
  for (const block of blocks) {
    const row = targetRow + block.row;
    const col = targetCol + block.col;
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false;
    if (grid[row][col] !== null) return false;
  }
  return true;
};

const placeShapeOnGrid = (
  grid: Grid, blocks: Block[], targetRow: number, targetCol: number,
  color: string, diamondIndex: number | null
): Grid => {
  const newGrid = deepCopyGrid(grid);
  blocks.forEach((block, index) => {
    const row = targetRow + block.row;
    const col = targetCol + block.col;
    newGrid[row][col] = { color, diamond: index === diamondIndex };
  });
  return newGrid;
};

const checkAndClear = (grid: Grid): { grid: Grid; clearedCount: number; points: number } => {
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    if (grid[row].every(cell => cell !== null)) rowsToClear.push(row);
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    let full = true;
    for (let row = 0; row < GRID_SIZE; row++) {
      if (grid[row][col] === null) { full = false; break; }
    }
    if (full) colsToClear.push(col);
  }

  let points = 0;
  const newGrid = deepCopyGrid(grid);

  rowsToClear.forEach(row => {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = newGrid[row][col];
      if (cell) points += cell.diamond ? 50 : 10;
      newGrid[row][col] = null;
    }
  });

  colsToClear.forEach(col => {
    for (let row = 0; row < GRID_SIZE; row++) {
      if (!rowsToClear.includes(row)) {
        const cell = newGrid[row][col];
        if (cell) points += cell.diamond ? 50 : 10;
      }
      newGrid[row][col] = null;
    }
  });

  return { grid: newGrid, clearedCount: rowsToClear.length + colsToClear.length, points };
};

const isGameOver = (grid: Grid, shapes: ActiveShape[]): boolean => {
  for (const shape of shapes) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (canPlaceShape(grid, shape.blocks, row, col)) return false;
      }
    }
  }
  return true;
};

const weightedRandom = (): string => {
  const total = SHAPE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let rand = Math.random() * total;
  for (const [type, weight] of SHAPE_WEIGHTS) {
    rand -= weight;
    if (rand <= 0) return type;
  }
  return SHAPE_WEIGHTS[0][0];
};

const generateShape = (): ActiveShape => {
  const type = weightedRandom();
  const blocks = [...SHAPE_DEFINITIONS[type]];
  const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
  const hasDiamond = Math.random() < 0.12;
  return {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type, color, blocks, hasDiamond,
    diamondIndex: hasDiamond ? Math.floor(Math.random() * blocks.length) : null,
  };
};

const generateShapes = (): ActiveShape[] => [generateShape(), generateShape(), generateShape()];

const getShapeBounds = (blocks: Block[]) => ({
  width: Math.max(...blocks.map(b => b.col)) + 1,
  height: Math.max(...blocks.map(b => b.row)) + 1,
});

const getStreakMultiplier = (streak: number): number => {
  if (streak >= 50) return 6;
  if (streak >= 40) return 5;
  if (streak >= 30) return 4;
  if (streak >= 20) return 3;
  if (streak >= 10) return 2;
  return 1;
};

// ============ COMPONENTS ============

const CellComponent: React.FC<{ cell: Cell | null; isPreview?: boolean; canPlace?: boolean }> = ({
  cell, isPreview = false, canPlace = true
}) => (
  <View style={[
    styles.cell,
    {
      backgroundColor: cell ? cell.color
        : isPreview ? (canPlace ? 'rgba(78, 205, 196, 0.5)' : 'rgba(255, 107, 107, 0.5)')
        : COLORS.cellEmpty,
    }
  ]}>
    {cell?.diamond && <View style={styles.diamond} />}
  </View>
);

const GridComponent: React.FC<{
  grid: Grid;
  previewBlocks?: Block[];
  previewPos?: { row: number; col: number };
  canPlace?: boolean;
}> = ({ grid, previewBlocks, previewPos, canPlace = true }) => {
  const isPreview = (r: number, c: number) =>
    previewBlocks && previewPos &&
    previewBlocks.some(b => previewPos.row + b.row === r && previewPos.col + b.col === c);

  return (
    <View style={styles.gridContainer}>
      <View style={styles.grid}>
        {grid.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((cell, ci) => (
              <CellComponent
                key={`${ri}-${ci}`}
                cell={cell}
                isPreview={!cell && isPreview(ri, ci)}
                canPlace={canPlace}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const ShapeComponent: React.FC<{
  shape: ActiveShape;
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number) => void;
}> = ({ shape, onDragStart, onDragMove, onDragEnd }) => {
  const bounds = getShapeBounds(shape.blocks);
  const blockSize = 25;
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        setDragging(true);
        onDragStart();
      },
      onPanResponderMove: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        setOffset({ x: gesture.dx, y: gesture.dy - 80 });
        onDragMove(e.nativeEvent.pageX, e.nativeEvent.pageY - 80);
      },
      onPanResponderRelease: (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        setDragging(false);
        onDragEnd(e.nativeEvent.pageX, e.nativeEvent.pageY - 80);
        setOffset({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.shapeContainer,
        {
          width: bounds.width * blockSize,
          height: bounds.height * blockSize,
          transform: [{ translateX: offset.x }, { translateY: offset.y }, { scale: dragging ? 1.2 : 1 }],
          zIndex: dragging ? 100 : 1,
          opacity: dragging ? 0.9 : 1,
        },
      ]}
    >
      {shape.blocks.map((block, i) => (
        <View
          key={i}
          style={[
            styles.shapeBlock,
            {
              backgroundColor: shape.color,
              left: block.col * blockSize,
              top: block.row * blockSize,
              width: blockSize - 2,
              height: blockSize - 2,
            },
          ]}
        >
          {shape.hasDiamond && shape.diamondIndex === i && <View style={styles.smallDiamond} />}
        </View>
      ))}
    </View>
  );
};

const ScoreDisplay: React.FC<{ score: number; highScore: number; streak: number }> = ({
  score, highScore, streak
}) => {
  const mult = getStreakMultiplier(streak);
  return (
    <View style={styles.scoreContainer}>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={styles.highScoreValue}>{highScore.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.streakRow}>
        <Text style={styles.streakLabel}>STREAK: {streak}</Text>
        {mult > 1 && <Text style={styles.multiplier}>x{mult}</Text>}
      </View>
    </View>
  );
};

const GameOverModal: React.FC<{
  visible: boolean; score: number; highScore: number; onRestart: () => void;
}> = ({ visible, score, highScore, onRestart }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>GAME OVER</Text>
        {score >= highScore && score > 0 && (
          <Text style={styles.newHighScore}>NEW HIGH SCORE!</Text>
        )}
        <Text style={styles.modalScore}>{score.toLocaleString()}</Text>
        <TouchableOpacity style={styles.restartBtn} onPress={onRestart}>
          <Text style={styles.restartText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ============ MAIN APP ============
export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    grid: createEmptyGrid(),
    availableShapes: generateShapes(),
    score: 0,
    streak: 0,
    highScore: 0,
    isGameOver: false,
  });

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState<{ row: number; col: number } | null>(null);
  const [previewBlocks, setPreviewBlocks] = useState<Block[] | null>(null);
  const [canPlacePreview, setCanPlacePreview] = useState(true);
  const gridRef = useRef<View>(null);
  const [gridLayout, setGridLayout] = useState<{ x: number; y: number } | null>(null);

  const onGridLayout = () => {
    gridRef.current?.measureInWindow((x, y) => setGridLayout({ x, y }));
  };

  const screenToGrid = (x: number, y: number): { row: number; col: number } | null => {
    if (!gridLayout) return null;
    const gridStartX = gridLayout.x + 6;
    const gridStartY = gridLayout.y + 6;
    const col = Math.floor((x - gridStartX) / CELL_SIZE);
    const row = Math.floor((y - gridStartY) / CELL_SIZE);
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null;
    return { row, col };
  };

  const handleDragStart = (id: string) => setDraggingId(id);

  const handleDragMove = (id: string, x: number, y: number) => {
    const shape = gameState.availableShapes.find(s => s.id === id);
    if (!shape) return;
    const pos = screenToGrid(x, y);
    if (pos) {
      setPreviewPos(pos);
      setPreviewBlocks(shape.blocks);
      setCanPlacePreview(canPlaceShape(gameState.grid, shape.blocks, pos.row, pos.col));
    } else {
      setPreviewPos(null);
      setPreviewBlocks(null);
    }
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    const shape = gameState.availableShapes.find(s => s.id === id);
    if (!shape) return;

    const pos = screenToGrid(x, y);
    if (pos && canPlaceShape(gameState.grid, shape.blocks, pos.row, pos.col)) {
      setGameState(prev => {
        let newGrid = placeShapeOnGrid(prev.grid, shape.blocks, pos.row, pos.col, shape.color, shape.diamondIndex);
        const clearResult = checkAndClear(newGrid);
        newGrid = clearResult.grid;

        const mult = getStreakMultiplier(prev.streak);
        const newScore = prev.score + clearResult.points * mult;
        const newStreak = clearResult.clearedCount > 0 ? prev.streak + clearResult.clearedCount : prev.streak;

        let newShapes = prev.availableShapes.filter(s => s.id !== id);
        if (newShapes.length === 0) {
          newShapes = generateShapes();
        }

        const gameOver = isGameOver(newGrid, newShapes);

        return {
          ...prev,
          grid: newGrid,
          availableShapes: newShapes,
          score: newScore,
          streak: newStreak,
          highScore: Math.max(prev.highScore, newScore),
          isGameOver: gameOver,
        };
      });
    }

    setDraggingId(null);
    setPreviewPos(null);
    setPreviewBlocks(null);
  };

  const resetGame = () => {
    setGameState(prev => ({
      grid: createEmptyGrid(),
      availableShapes: generateShapes(),
      score: 0,
      streak: 0,
      highScore: prev.highScore,
      isGameOver: false,
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScoreDisplay
        score={gameState.score}
        highScore={gameState.highScore}
        streak={gameState.streak}
      />

      <View ref={gridRef} onLayout={onGridLayout}>
        <GridComponent
          grid={gameState.grid}
          previewBlocks={previewBlocks ?? undefined}
          previewPos={previewPos ?? undefined}
          canPlace={canPlacePreview}
        />
      </View>

      <View style={styles.shapesPanel}>
        {gameState.availableShapes.map(shape => (
          <View key={shape.id} style={styles.shapeWrapper}>
            <ShapeComponent
              shape={shape}
              onDragStart={() => handleDragStart(shape.id)}
              onDragMove={(x, y) => handleDragMove(shape.id, x, y)}
              onDragEnd={(x, y) => handleDragEnd(shape.id, x, y)}
            />
          </View>
        ))}
      </View>

      <GameOverModal
        visible={gameState.isGameOver}
        score={gameState.score}
        highScore={gameState.highScore}
        onRestart={resetGame}
      />
    </View>
  );
}

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  scoreContainer: {
    padding: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  highScoreValue: {
    color: COLORS.accent,
    fontSize: 28,
    fontWeight: 'bold',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  streakLabel: {
    color: '#F39C12',
    fontSize: 16,
    fontWeight: 'bold',
  },
  multiplier: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gridContainer: {
    alignItems: 'center',
    padding: GRID_PADDING,
  },
  grid: {
    backgroundColor: COLORS.gridBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.gridBorder,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamond: {
    width: '40%',
    height: '40%',
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
  },
  smallDiamond: {
    width: '35%',
    height: '35%',
    backgroundColor: 'white',
    transform: [{ rotate: '45deg' }],
  },
  shapesPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 10,
    minHeight: 140,
  },
  shapeWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeContainer: {
    position: 'relative',
  },
  shapeBlock: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  modalTitle: {
    color: COLORS.accent,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  newHighScore: {
    color: '#F39C12',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalScore: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  restartText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
