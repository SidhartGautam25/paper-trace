import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_THEMES } from '../constants/theme';
import { getStats, resetStats, GameStats } from '../utils/stats';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = GAME_THEMES[0]; // Use default Cyber Neon aesthetic
  const colors = theme.colors;

  const [stats, setStats] = useState<GameStats>({ gamesPlayed: 0, wins: 0, losses: 0 });

  useEffect(() => {
    setStats(getStats());
  }, []);

  const handleReset = () => {
    resetStats();
    setStats(getStats());
  };

  const winRatio = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  const isThreeButtonNav = insets.bottom >= 30;

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Top Status Bar Spacer */}
      <View style={{ height: insets.top, backgroundColor: colors.background }} />

      {/* Header HUD */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.border + '22' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: colors.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Stats & History</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={[styles.content, { paddingBottom: isThreeButtonNav ? 20 : Math.max(insets.bottom, 16) }]}>
        {/* Stats Grid Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>Performance Overview</Text>
          
          <View style={styles.statGroup}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.gamesPlayed}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Matches</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.p1Shades[0] }]}>{winRatio}%</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Win Rate</Text>
            </View>
          </View>

          <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Victories:</Text>
            <Text style={[styles.detailValue, { color: colors.p1Shades[0] }]}>{stats.wins} Wins</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Defeats:</Text>
            <Text style={[styles.detailValue, { color: '#EF4444' }]}>{stats.losses} Losses</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.resetText}>Reset Statistics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: colors.accent }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.homeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === 'android' && isThreeButtonNav && (
        <View style={{ height: insets.bottom, backgroundColor: '#000000', width: '100%' }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1.5,
  },
  backButton: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  statSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 40,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    width: 1.5,
    height: 48,
  },
  horizontalDivider: {
    width: '100%',
    height: 1,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  resetButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resetText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  homeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  homeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
