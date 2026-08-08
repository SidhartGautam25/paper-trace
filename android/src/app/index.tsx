import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Circle, Line, G } from 'react-native-svg';
import { GAME_THEMES, KILL_EFFECTS } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  // Centralized difficulties (easy to add more later)
  const difficulties: { id: 'easy' | 'medium' | 'hard'; label: string; desc: string }[] = [
    { id: 'easy', label: 'Easy', desc: 'Predictable paths. Great for training.' },
    { id: 'medium', label: 'Medium', desc: 'Greedy heuristic. Looks for immediate cuts.' },
    { id: 'hard', label: 'Hard', desc: 'Minimax lookahead. Avoids counter-attacks.' },
  ];

  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('cyber-neon');
  const [selectedKillEffect, setSelectedKillEffect] = useState<'collapse' | 'explode' | 'dissolve' | 'monster' | 'hammer'>('collapse');

  const currentTheme = GAME_THEMES.find((t) => t.id === selectedThemeId) || GAME_THEMES[0];

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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors.background} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Game Logo Header */}
        <View style={styles.logoContainer}>
          <Svg width={80} height={80} viewBox="0 0 80 80">
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

        {/* Difficulty Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Select Intelligence Level
          </Text>
          
          {difficulties.map((diff) => {
            const isSelected = selectedDifficulty === diff.id;
            return (
              <TouchableOpacity
                key={diff.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: currentTheme.colors.cardBackground,
                    borderColor: isSelected ? currentTheme.colors.accent : currentTheme.colors.border,
                  },
                ]}
                onPress={() => setSelectedDifficulty(diff.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? currentTheme.colors.accent : currentTheme.colors.textSecondary,
                        backgroundColor: isSelected ? currentTheme.colors.accent : 'transparent',
                      },
                    ]}
                  />
                  <Text style={[styles.cardTitle, { color: currentTheme.colors.textPrimary }]}>
                    {diff.label}
                  </Text>
                </View>
                <Text style={[styles.cardDesc, { color: currentTheme.colors.textSecondary }]}>
                  {diff.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Color Theme Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Select Grid Aesthetic
          </Text>

          {GAME_THEMES.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: currentTheme.colors.cardBackground,
                    borderColor: isSelected ? currentTheme.colors.accent : currentTheme.colors.border,
                  },
                ]}
                onPress={() => setSelectedThemeId(theme.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.themeName, { color: currentTheme.colors.textPrimary }]}>
                  {theme.name}
                </Text>

                {/* Dot Color Previews */}
                <View style={styles.previewContainer}>
                  {/* P1 Shades */}
                  <View style={styles.shadeGroup}>
                    {theme.colors.p1Shades.map((shade, i) => (
                      <View key={`p1_${i}`} style={[styles.previewDot, { backgroundColor: shade }]} />
                    ))}
                  </View>
                  <Text style={[styles.vsText, { color: currentTheme.colors.textSecondary }]}>vs</Text>
                  {/* P2 Shades */}
                  <View style={styles.shadeGroup}>
                    {theme.colors.p2Shades.map((shade, i) => (
                      <View key={`p2_${i}`} style={[styles.previewDot, { backgroundColor: shade }]} />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Elimination Effect Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Select Elimination Effect
          </Text>

          {KILL_EFFECTS.map((effect) => {
            const isSelected = selectedKillEffect === effect.id;
            return (
              <TouchableOpacity
                key={effect.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: currentTheme.colors.cardBackground,
                    borderColor: isSelected ? currentTheme.colors.accent : currentTheme.colors.border,
                  },
                ]}
                onPress={() => setSelectedKillEffect(effect.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? currentTheme.colors.accent : currentTheme.colors.textSecondary,
                        backgroundColor: isSelected ? currentTheme.colors.accent : 'transparent',
                      },
                    ]}
                  />
                  <Text style={[styles.cardTitle, { color: currentTheme.colors.textPrimary }]}>
                    {effect.name}
                  </Text>
                </View>
                <Text style={[styles.cardDesc, { color: currentTheme.colors.textSecondary }]}>
                  {effect.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Launch Button */}
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: currentTheme.colors.accent }]}
          onPress={handlePlayGame}
          activeOpacity={0.8}
        >
          <Text style={styles.playButtonText}>Play Game</Text>
        </TouchableOpacity>

        {/* Utility Buttons */}
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
    paddingTop: 48,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  optionCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 24,
  },
  themeCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  themeName: {
    fontSize: 15,
    fontWeight: '700',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shadeGroup: {
    flexDirection: 'row',
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  vsText: {
    fontSize: 11,
    marginHorizontal: 8,
    fontWeight: '700',
  },
  playButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 4,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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
