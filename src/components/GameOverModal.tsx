import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { UI_COLORS } from '../constants';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  highScore: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  highScore,
  onRestart,
}) => {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>GAME OVER</Text>

          {isNewHighScore && (
            <Text style={styles.newHighScore}>NEW HIGH SCORE!</Text>
          )}

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>BEST</Text>
            <Text style={styles.highScoreValue}>
              {highScore.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onRestart}>
            <Text style={styles.buttonText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: UI_COLORS.background,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: UI_COLORS.accent,
    minWidth: 280,
  },
  title: {
    color: UI_COLORS.accent,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  newHighScore: {
    color: UI_COLORS.warning,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreLabel: {
    color: UI_COLORS.textSecondary,
    fontSize: 14,
  },
  scoreValue: {
    color: UI_COLORS.text,
    fontSize: 36,
    fontWeight: 'bold',
  },
  highScoreValue: {
    color: UI_COLORS.accent,
    fontSize: 36,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: UI_COLORS.accent,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: UI_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
