import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Circle, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_THEMES, KILL_EFFECTS } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    difficulty?: string;
    themeId?: string;
    killEffect?: string;
    lines?: string;
    p1DotColor?: string;
    p1LineColor?: string;
    p2DotColor?: string;
    p2LineColor?: string;
    p1DotShape?: string;
    p2DotShape?: string;
  }>();
  const insets = useSafeAreaInsets();

  // Local state for configuration
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('cyber-neon');
  const [selectedKillEffect, setSelectedKillEffect] = useState<'collapse' | 'explode' | 'dissolve' | 'monster' | 'hammer' | 'burn' | 'firecracker'>('collapse');
  const [selectedLines, setSelectedLines] = useState<string>('solid,dotted,glow');

  const currentTheme = GAME_THEMES.find((t) => t.id === selectedThemeId) || GAME_THEMES[0];

  const getThemeDefaultColors = (themeId: string) => {
    switch (themeId) {
      case 'emerald-gold':
        return { p1: '#00FF66', p2: '#FFB900' };
      case 'steel-ember':
        return { p1: '#00F2FF', p2: '#FF2A2A' };
      case 'cosmic-nebula':
        return { p1: '#9B51E0', p2: '#FE53BB' };
      case 'cyber-neon':
      default:
        return { p1: '#00F2FF', p2: '#FE53BB' };
    }
  };

  const [p1DotColor, setP1DotColor] = useState<string>(() => getThemeDefaultColors('cyber-neon').p1);
  const [p1LineColor, setP1LineColor] = useState<string>(() => getThemeDefaultColors('cyber-neon').p1);
  const [p2DotColor, setP2DotColor] = useState<string>(() => getThemeDefaultColors('cyber-neon').p2);
  const [p2LineColor, setP2LineColor] = useState<string>(() => getThemeDefaultColors('cyber-neon').p2);

  // Custom Shapes State
  const [p1DotShape, setP1DotShape] = useState<'circle' | 'arrow' | 'hexagon' | 'diamond' | 'square' | 'star'>('circle');
  const [p2DotShape, setP2DotShape] = useState<'circle' | 'arrow' | 'hexagon' | 'diamond' | 'square' | 'star'>('circle');

  // Synchronize state with route params when coming back from Settings
  useEffect(() => {
    if (params.difficulty) setSelectedDifficulty(params.difficulty as any);
    if (params.themeId) {
      setSelectedThemeId(params.themeId);
      const defaults = getThemeDefaultColors(params.themeId);
      setP1DotColor(params.p1DotColor || defaults.p1);
      setP1LineColor(params.p1LineColor || defaults.p1);
      setP2DotColor(params.p2DotColor || defaults.p2);
      setP2LineColor(params.p2LineColor || defaults.p2);
    } else {
      if (params.p1DotColor) setP1DotColor(params.p1DotColor);
      if (params.p1LineColor) setP1LineColor(params.p1LineColor);
      if (params.p2DotColor) setP2DotColor(params.p2DotColor);
      if (params.p2LineColor) setP2LineColor(params.p2LineColor);
    }
    if (params.killEffect) setSelectedKillEffect(params.killEffect as any);
    if (params.lines) setSelectedLines(params.lines);
    if (params.p1DotShape) setP1DotShape(params.p1DotShape as any);
    if (params.p2DotShape) setP2DotShape(params.p2DotShape as any);
  }, [
    params.difficulty,
    params.themeId,
    params.killEffect,
    params.lines,
    params.p1DotColor,
    params.p1LineColor,
    params.p2DotColor,
    params.p2LineColor,
    params.p1DotShape,
    params.p2DotShape,
  ]);

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
        lines: selectedLines,
        p1DotColor,
        p1LineColor,
        p2DotColor,
        p2LineColor,
        p1DotShape,
        p2DotShape,
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
        lines: selectedLines,
        p1DotColor,
        p1LineColor,
        p2DotColor,
        p2LineColor,
        p1DotShape,
        p2DotShape,
      },
    });
  };

  const isThreeButtonNav = insets.bottom >= 30;

  return (
    <View style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors.background} />
      
      {/* Top Status Bar Spacer */}
      <View style={{ height: insets.top, backgroundColor: currentTheme.colors.background }} />

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: isThreeButtonNav ? 24 : Math.max(insets.bottom, 16) }
        ]} 
        showsVerticalScrollIndicator={false}
      >
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 10,
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
    marginVertical: 12,
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
    marginVertical: 16,
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
    marginTop: 12,
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
