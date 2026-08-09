import React, { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GAME_THEMES, KILL_EFFECTS } from '../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string; themeId?: string; killEffect?: string }>();
  const insets = useSafeAreaInsets();

  const difficulties: { id: 'easy' | 'medium' | 'hard'; label: string; desc: string }[] = [
    { id: 'easy', label: 'Easy', desc: 'Predictable paths. Great for training.' },
    { id: 'medium', label: 'Medium', desc: 'Greedy heuristic. Looks for immediate cuts.' },
    { id: 'hard', label: 'Hard', desc: 'Minimax lookahead. Avoids counter-attacks.' },
  ];

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    (params.difficulty as any) || 'medium'
  );
  const [themeId, setThemeId] = useState<string>(params.themeId || 'cyber-neon');
  const [killEffect, setKillEffect] = useState<'collapse' | 'explode' | 'dissolve' | 'monster' | 'hammer' | 'burn' | 'firecracker'>(
    (params.killEffect as any) || 'collapse'
  );

  const currentTheme = GAME_THEMES.find((t) => t.id === themeId) || GAME_THEMES[0];

  const handleBack = () => {
    router.replace({
      pathname: '/',
      params: {
        difficulty,
        themeId,
        killEffect,
      },
    });
  };

  const isThreeButtonNav = insets.bottom >= 30;

  return (
    <View style={[styles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.colors.background} />
      
      {/* Top Status Bar Spacer */}
      <View style={{ height: insets.top, backgroundColor: currentTheme.colors.background }} />

      {/* Header Row */}
      <View style={[styles.header, { borderBottomColor: currentTheme.colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: currentTheme.colors.border }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={[styles.backButtonText, { color: currentTheme.colors.textPrimary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.textPrimary }]}>
          Configurations
        </Text>
        <View style={{ width: 68 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: isThreeButtonNav ? 24 : Math.max(insets.bottom, 16) }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Intelligence Level */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Intelligence Level
          </Text>
          {difficulties.map((diff) => {
            const isSelected = difficulty === diff.id;
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
                onPress={() => setDifficulty(diff.id)}
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

        {/* Grid Aesthetics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Grid Aesthetics
          </Text>
          {GAME_THEMES.map((theme) => {
            const isSelected = themeId === theme.id;
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
                onPress={() => setThemeId(theme.id)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? currentTheme.colors.accent : currentTheme.colors.textSecondary,
                        backgroundColor: isSelected ? currentTheme.colors.accent : 'transparent',
                        marginRight: 10,
                      },
                    ]}
                  />
                  <Text style={[styles.themeName, { color: currentTheme.colors.textPrimary }]}>
                    {theme.name}
                  </Text>
                </View>

                {/* Dot Color Previews */}
                <View style={styles.previewContainer}>
                  <View style={styles.shadeGroup}>
                    {theme.colors.p1Shades.map((shade, i) => (
                      <View key={`p1_${i}`} style={[styles.previewDot, { backgroundColor: shade }]} />
                    ))}
                  </View>
                  <Text style={[styles.vsText, { color: currentTheme.colors.textSecondary }]}>vs</Text>
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

        {/* Elimination Effects */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Elimination Effect
          </Text>
          {KILL_EFFECTS.map((effect) => {
            const isSelected = killEffect === effect.id;
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
                onPress={() => setKillEffect(effect.id)}
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

        {/* Apply Settings Button */}
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: currentTheme.colors.accent }]}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Apply Configurations</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
  },
  backButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
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
    fontSize: 15,
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
    paddingHorizontal: 14,
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
  applyButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 4,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
