import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Circle, Line } from 'react-native-svg';
import { GAME_THEMES, KILL_EFFECTS } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string; themeId?: string; killEffect?: string }>();

  // Local state for configuration
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('cyber-neon');
  const [selectedKillEffect, setSelectedKillEffect] = useState<'collapse' | 'explode' | 'dissolve' | 'monster' | 'hammer'>('collapse');

  // Synchronize state with route params when coming back from Settings
  useEffect(() => {
    if (params.difficulty) setSelectedDifficulty(params.difficulty as any);
    if (params.themeId) setSelectedThemeId(params.themeId);
    if (params.killEffect) setSelectedKillEffect(params.killEffect as any);
  }, [params.difficulty, params.themeId, params.killEffect]);

  const currentTheme = GAME_THEMES.find((t) => t.id === selectedThemeId) || GAME_THEMES[0];
  const currentEffect = KILL_EFFECTS.find((e) => e.id === selectedKillEffect) || KILL_EFFECTS[0];

  const difficultyLabels = {
    easy: 'Easy (Predictable Paths)',
    medium: 'Medium (Greedy Heuristic)',
    hard: 'Hard (Minimax Lookahead)',
  };

  const handlePlayGame = () => {
    router.push({
      pathname: '/game',
      params: {
        difficulty: selectedDifficulty,
        themeId: selectedThemeId,
        killEffect: selectedKillEffect,
      },
    });
  };

  const handleOpenSettings = () => {
    router.push({
      pathname: '/settings',
      params: {
        difficulty: selectedDifficulty,
        themeId: selectedThemeId,
        killEffect: selectedKillEffect,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors.background} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Game Logo Header */}
        <View style={styles.logoContainer}>
          <Svg width={100} height={100} viewBox="0 0 80 80">
            {/* Background circular radar grid */}
            <Circle cx={40} cy={40} r={38} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <Circle cx={40} cy={40} r={26} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <Circle cx={40} cy={40} r={14} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            {/* Clashing Vectors */}
            <Line x1={20} y1={60} x2={50} y2={30} stroke={currentTheme.colors.p1Shades[0]} strokeWidth={3} strokeLinecap="round" />
            <Line x1={60} y1={60} x2={30} y2={30} stroke={currentTheme.colors.p2Shades[0]} strokeWidth={3} strokeLinecap="round" />
            {/* Glowing nodes */}
            <Circle cx={20} cy={60} r={5} fill={currentTheme.colors.p1Shades[1]} />
            <Circle cx={50} cy={30} r={6} fill={currentTheme.colors.p1Shades[2]} />
            <Circle cx={60} cy={60} r={5} fill={currentTheme.colors.p2Shades[1]} />
            <Circle cx={30} cy={30} r={6} fill={currentTheme.colors.p2Shades[2]} />
          </Svg>
          
          <Text style={[styles.appTitle, { color: currentTheme.colors.textPrimary }]}>
            PAPER TRACE
          </Text>
          <Text style={[styles.appSubtitle, { color: currentTheme.colors.textSecondary }]}>
            Vector-Grid Tactics
          </Text>
        </View>

        {/* Dynamic Config Summary Panel */}
        <View
          style={[
            styles.configCard,
            {
              backgroundColor: currentTheme.colors.cardBackground,
              borderColor: currentTheme.colors.border,
            },
          ]}
        >
          <Text style={[styles.configCardTitle, { color: currentTheme.colors.textPrimary }]}>
            Current Game Rules
          </Text>

          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: currentTheme.colors.textSecondary }]}>
              Level
            </Text>
            <Text style={[styles.configVal, { color: currentTheme.colors.textPrimary }]}>
              {difficultyLabels[selectedDifficulty]}
            </Text>
          </View>

          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: currentTheme.colors.textSecondary }]}>
              Aesthetic
            </Text>
            <Text style={[styles.configVal, { color: currentTheme.colors.textPrimary }]}>
              {currentTheme.name}
            </Text>
          </View>

          <View style={styles.configRow}>
            <Text style={[styles.configLabel, { color: currentTheme.colors.textSecondary }]}>
              Elimination
            </Text>
            <Text style={[styles.configVal, { color: currentTheme.colors.textPrimary }]}>
              {currentEffect.name}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.settingsButton, { borderColor: currentTheme.colors.border }]}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingsButtonText, { color: currentTheme.colors.accent }]}>
              Configure Settings ⚙️
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Play Button (Focused and Prominent in the center) */}
        <View style={styles.playButtonContainer}>
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: currentTheme.colors.accent }]}
            onPress={handlePlayGame}
            activeOpacity={0.8}
          >
            <Text style={styles.playButtonText}>PLAY GAME</Text>
          </TouchableOpacity>
        </View>

        {/* Utility row for stats and rules */}
        <View style={styles.utilityRow}>
          <TouchableOpacity
            style={[styles.utilityButton, { borderColor: currentTheme.colors.border }]}
            onPress={() => router.push('/rules' as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.utilityButtonText, { color: currentTheme.colors.textPrimary }]}>
              📖 Rules & Guide
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.utilityButton, { borderColor: currentTheme.colors.border }]}
            onPress={() => router.push('/history' as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.utilityButtonText, { color: currentTheme.colors.textPrimary }]}>
              📊 Stats & History
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 16,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },
  configCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    marginVertical: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  configCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 16,
    textAlign: 'center',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  configVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  settingsButton: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  settingsButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  playButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  playButton: {
    borderRadius: 20,
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    transform: [{ scale: 1.02 }],
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  utilityButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  utilityButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
