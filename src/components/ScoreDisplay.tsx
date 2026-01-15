import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UI_COLORS } from '../constants';
import { getStreakMultiplier } from '../constants/balance';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
  streak: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  highScore,
  streak,
}) => {
  const multiplier = getStreakMultiplier(streak);

  const getStreakLabel = () => {
    if (streak >= 50) return 'LEGENDARY';
    if (streak >= 30) return 'UNSTOPPABLE';
    if (streak >= 20) return 'ON FIRE';
    if (streak >= 10) return 'NICE';
    return '';
  };

  const streakLabel = getStreakLabel();

  return (
    <View style={styles.container}>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.label}>SCORE</Text>
          <Text style={styles.score}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.label}>BEST</Text>
          <Text style={styles.highScore}>{highScore.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.streakRow}>
        <Text style={styles.streakLabel}>STREAK</Text>
        <Text style={styles.streakValue}>{streak}</Text>
        {multiplier > 1 && (
          <Text style={styles.multiplier}>x{multiplier}</Text>
        )}
        {streakLabel && <Text style={styles.streakStatus}>{streakLabel}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  label: {
    color: UI_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  score: {
    color: UI_COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  highScore: {
    color: UI_COLORS.accent,
    fontSize: 28,
    fontWeight: 'bold',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  streakLabel: {
    color: UI_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  streakValue: {
    color: UI_COLORS.warning,
    fontSize: 20,
    fontWeight: 'bold',
  },
  multiplier: {
    color: UI_COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakStatus: {
    color: UI_COLORS.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
