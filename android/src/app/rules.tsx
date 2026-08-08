import React from 'react';
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
import { GAME_THEMES } from '../constants/theme';

export default function RulesScreen() {
  const router = useRouter();
  const theme = GAME_THEMES[0]; // Use default Cyber Neon aesthetic
  const colors = theme.colors;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header HUD */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.border + '22' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, { color: colors.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Rules & Guide</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rules Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.accent }]}>1. Gameplay Objective</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Paper Trace is a vector-grid strategy game. Your goal is to maneuver your nodes, draw lines, and eliminate the opponent's nodes by intersecting their trails or landing on them directly.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.accent }]}>2. Movement & Tokens</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            • On your turn, select one of your alive nodes.{"\n"}
            • Choose a <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Distance Token (1 to 5)</Text>. This defines how many grid spaces your node will travel.{"\n"}
            • Swipe in any of the <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>8 tactical directions</Text> (horizontal, vertical, or diagonal) to draw the vector and move your node.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.accent }]}>3. Elimination Mechanics</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            • <Text style={{ color: '#EF4444', fontWeight: '700' }}>Direct Hit:</Text> Landing directly on the exact grid intersection where an enemy node resides destroys it instantly.{"\n"}
            • <Text style={{ color: '#EF4444', fontWeight: '700' }}>Line Cutting:</Text> Moving your node across an active enemy trail segment will cut their connection and destroy that enemy node.{"\n"}
            • <Text style={{ color: colors.p1Shades[0], fontWeight: '700' }}>Self-Pruning:</Text> If your path crosses one of your own active trails, you will prune (erase) those intersected segments without harming your node.
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.accent }]}>4. Game Over & Tie-Breaker</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            The game ends when a player loses all their nodes, or when the active player runs out of valid moves (no tokens left or all remaining moves go out-of-bounds).{"\n\n"}
            If moves are exhausted, the winner is determined by:{"\n"}
            1. <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Node Advantage:</Text> Whoever has more nodes alive wins.{"\n"}
            2. <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Base Distance Tie-Breaker:</Text> If node counts are equal, whoever is further from their starting baseline wins!
          </Text>

          <View style={[styles.formulaBox, { borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' }]}>
            <Text style={[styles.formulaTitle, { color: colors.textPrimary }]}>Distance Calculation:</Text>
            <Text style={[styles.formulaText, { color: colors.textSecondary }]}>
              • Your Base: Bottom Row (Row 14). Distance = <Text style={{ color: colors.p1Shades[0] }}>14 - current row</Text>.{"\n"}
              • Bot Base: Top Row (Row 0). Distance = <Text style={{ color: colors.p2Shades[0] }}>current row</Text>.
            </Text>
            <Text style={[styles.exampleText, { color: colors.accent }]}>
              Example: Bot has two nodes alive at row 6 and row 2 (score = 6 + 2 = 8). You have two nodes alive at row 9 and row 10 (score = 5 + 4 = 9). Since 9 &gt; 8, you win!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.backMenuButton, { backgroundColor: colors.accent }]}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Text style={styles.backMenuText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  formulaBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  formulaText: {
    fontSize: 12,
    lineHeight: 18,
  },
  exampleText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 10,
    fontStyle: 'italic',
  },
  backMenuButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  backMenuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
