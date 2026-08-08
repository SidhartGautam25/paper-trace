import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePaperSession } from '../hooks/usePaperSession';
import { GAME_THEMES, GameTheme } from '../constants/theme';
import { GridCanvas } from '../components/canvas/GridCanvas';
import { TokenPicker } from '../components/ui/TokenPicker';
import { DirectionPad } from '../components/ui/DirectionPad';
import { PlayerStatusBar } from '../components/ui/PlayerStatusBar';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string; themeId?: string; killEffect?: string }>();
  
  // Extract inputs or fallback to defaults
  const difficulty = (params.difficulty === 'easy' || params.difficulty === 'medium' || params.difficulty === 'hard')
    ? params.difficulty
    : 'medium';
  const themeId = params.themeId || 'cyber-neon';
  const killEffect = (params.killEffect === 'collapse' || params.killEffect === 'explode' || params.killEffect === 'dissolve')
    ? params.killEffect
    : 'collapse';

  // Find theme details
  const activeTheme = GAME_THEMES.find((t) => t.id === themeId) || GAME_THEMES[0];
  const themeColors = activeTheme.colors;

  // Initialize session
  const {
    dots,
    player1Tokens,
    activePlayer,
    winner,
    historyLogs,
    selectedDotId,
    selectedToken,
    selectedDirection,
    isAiThinking,
    selectDot,
    selectToken,
    selectDirection,
    executeMove,
    resetGame,
  } = usePaperSession(difficulty);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const handleExecute = () => {
    setErrorMsg(null);
    const result = executeMove();
    if (!result.success && result.error) {
      setErrorMsg(result.error);
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={activeTheme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.cardBackground}
      />
      
      {/* Header HUD */}
      <PlayerStatusBar
        activePlayer={activePlayer}
        winner={winner}
        difficulty={difficulty}
        isAiThinking={isAiThinking}
        onReset={resetGame}
        onBack={handleBack}
        themeColors={themeColors}
      />

      <View style={styles.mainContainer}>
        {/* Error banner */}
        {errorMsg && (
          <View style={[styles.errorBanner, { borderColor: '#EF4444', backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        )}

        {/* Board Canvas */}
        {/* Board Canvas */}
        <GridCanvas
          dots={dots}
          activePlayer={activePlayer}
          selectedDotId={selectedDotId}
          selectedToken={selectedToken}
          selectedDirection={selectedDirection}
          onSelectDot={selectDot}
          themeColors={themeColors}
          killEffect={killEffect}
          onSelectDirection={selectDirection}
          onGestureStart={() => setScrollEnabled(false)}
          onGestureEnd={() => {
            handleExecute();
            setScrollEnabled(true);
          }}
        />

        {/* Play controls card */}
        {activePlayer === 1 && !winner && (
          <View
            style={[
              styles.controlCard,
              {
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.border,
              },
            ]}
          >
            {/* Guide prompts */}
            <View style={styles.instructionsContainer}>
              {!selectedDotId ? (
                <Text style={[styles.instructionsText, { color: themeColors.textSecondary }]}>
                  👉 Tap one of your <Text style={{ color: themeColors.p1Shades[0], fontWeight: '700' }}>Dots</Text> on the board to select.
                </Text>
              ) : selectedToken === null ? (
                <Text style={[styles.instructionsText, { color: themeColors.textSecondary }]}>
                  👉 Select a <Text style={{ color: themeColors.textPrimary, fontWeight: '700' }}>Distance Token</Text> below.
                </Text>
              ) : (
                <Text style={[styles.instructionsText, { color: themeColors.textSecondary }]}>
                  👉 Swipe your finger on the board in any direction to <Text style={{ color: themeColors.p1Shades[0], fontWeight: '700' }}>draw the line</Text>!
                </Text>
              )}
            </View>

            {/* Token Selector */}
            {selectedDotId !== null && (
              <TokenPicker
                tokens={player1Tokens}
                selectedToken={selectedToken}
                onSelectToken={selectToken}
                themeColors={{
                  ...themeColors,
                  player1Ink: themeColors.p1Shades[0],
                  player1InkLight: themeColors.p1Shades[1] + '33', // added alpha for bg badge
                }}
              />
            )}
          </View>
        )}

        {/* AI calculation card */}
        {activePlayer === 2 && !winner && (
          <View
            style={[
              styles.thinkingCard,
              {
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Text style={[styles.thinkingText, { color: themeColors.textSecondary }]}>
              🤖 Ink Slasher Bot is analyzing moves...
            </Text>
          </View>
        )}


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: '90%',
    marginVertical: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '700',
  },
  controlCard: {
    width: '92%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    marginVertical: 12,
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  thinkingCard: {
    width: '92%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  thinkingText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionsContainer: {
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  padWrapper: {
    marginTop: 12,
  },
});
