import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PlayerStatusBarProps {
  activePlayer: 1 | 2;
  winner: 1 | 2 | null;
  difficulty: 'easy' | 'medium' | 'hard';
  isAiThinking: boolean;
  onReset: () => void;
  onBack: () => void;
  themeColors: any;
}

export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
  activePlayer,
  winner,
  difficulty,
  isAiThinking,
  onReset,
  onBack,
  themeColors,
}) => {
  const formatDiff = (diff: string) => {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground, borderBottomColor: themeColors.border }]}>
      {/* Top Row: Back Navigation, Title & Restart */}
      <View style={styles.topRow}>
        <View style={styles.leftGroup}>
          <TouchableOpacity
            style={[
              styles.navButton,
              {
                borderColor: themeColors.border,
                backgroundColor: themeColors.border + '22',
              },
            ]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, { color: themeColors.textSecondary }]}>← Menu</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>Paper Trace</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.resetButton,
            {
              borderColor: themeColors.accent,
              backgroundColor: themeColors.accent + '22',
            },
          ]}
          onPress={onReset}
          activeOpacity={0.7}
        >
          <Text style={[styles.resetText, { color: themeColors.accent }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Info Row: Displays Selected Difficulty level */}
      <View style={styles.infoRow}>
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          Opponent: <Text style={{ color: themeColors.p2Shades[0], fontWeight: '700' }}>{formatDiff(difficulty)} Bot</Text>
        </Text>
      </View>

      {/* Turn Indicator Banner */}
      <View style={styles.statusBanner}>
        {winner ? (
          <View style={styles.winBanner}>
            <Text style={styles.winText}>
              {winner === 1 ? '🎉 VICTORY! Enemy Defeated' : '💀 DEFEAT. Bot wins'}
            </Text>
          </View>
        ) : (
          <View style={styles.turnRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    activePlayer === 1 ? themeColors.p1Shades[0] : themeColors.p2Shades[0],
                },
              ]}
            />
            <Text style={[styles.turnText, { color: themeColors.textPrimary }]}>
              {activePlayer === 1
                ? 'Your Turn'
                : isAiThinking
                ? 'Ink Slasher is thinking...'
                : 'Ink Slasher turn'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    borderBottomWidth: 1.5,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 12,
  },
  navText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoRow: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  turnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  turnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  winBanner: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  winText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
