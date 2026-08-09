import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePaperSession } from '../hooks/usePaperSession';
import { GAME_THEMES, GameTheme } from '../constants/theme';
import { GridCanvas } from '../components/canvas/GridCanvas';
import { TokenPicker } from '../components/ui/TokenPicker';
import { DirectionPad } from '../components/ui/DirectionPad';
import { PlayerStatusBar } from '../components/ui/PlayerStatusBar';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string; themeId?: string; killEffect?: string }>();
  const insets = useSafeAreaInsets();
  
  // Extract inputs or fallback to defaults
  const difficulty = (params.difficulty === 'easy' || params.difficulty === 'medium' || params.difficulty === 'hard')
    ? params.difficulty
    : 'medium';
  const themeId = params.themeId || 'cyber-neon';
  const killEffect = (params.killEffect === 'collapse' || params.killEffect === 'explode' || params.killEffect === 'dissolve' || params.killEffect === 'monster' || params.killEffect === 'hammer' || params.killEffect === 'burn' || params.killEffect === 'firecracker')
    ? params.killEffect
    : 'collapse';

  // Find theme details
  const activeTheme = GAME_THEMES.find((t) => t.id === themeId) || GAME_THEMES[0];
  const themeColors = activeTheme.colors;

  // Initialize session
  const {
    dots,
    player1Tokens,
    player2Tokens,
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (winner) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.85);
    }
  }, [winner]);

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

  const isThreeButtonNav = insets.bottom >= 30;

  return (
    <View style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      {/* Top Status Bar Spacer */}
      <View style={{ height: insets.top, backgroundColor: themeColors.cardBackground }} />
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
        player1Tokens={player1Tokens}
        player2Tokens={player2Tokens}
      />

      <View style={styles.mainContainer}>
        {/* Error banner */}
        {errorMsg && (
          <View style={[styles.errorBanner, { borderColor: '#EF4444', backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        )}

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
          onGestureEnd={handleExecute}
        />

        {/* Bottom panel container with a fixed height to prevent layout shifting/shaking */}
        <View style={[styles.bottomContainer, { marginBottom: isThreeButtonNav ? 0 : Math.max(insets.bottom, 12) }]}>
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
              <TokenPicker
                tokens={player1Tokens}
                selectedToken={selectedToken}
                onSelectToken={selectToken}
                themeColors={{
                  ...themeColors,
                  player1Ink: themeColors.p1Shades[0],
                  player1InkLight: themeColors.p1Shades[1] + '33',
                }}
                disabled={selectedDotId === null}
              />
            </View>
          )}

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
      </View>

      {/* Winner Overlay Popup */}
      {winner && (
        <View style={[StyleSheet.absoluteFill, styles.overlayContainer]}>
          <Animated.View
            style={[
              styles.overlayCard,
              {
                backgroundColor: themeColors.cardBackground + 'FB',
                borderColor: themeColors.border,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={[styles.overlaySubtitle, { color: themeColors.textSecondary }]}>Match Over</Text>
            <Text style={[styles.overlayTitle, { color: winner === 1 ? themeColors.p1Shades[0] : '#EF4444' }]}>
              {winner === 1 ? '🎉 VICTORY' : '💀 DEFEAT'}
            </Text>
            <Text style={[styles.overlayDesc, { color: themeColors.textSecondary }]}>
              {winner === 1
                ? 'You have successfully out-inked the Bot!'
                : 'The Bot has defeated you in battle.'}
            </Text>

            <View style={[styles.overlayScores, { borderColor: themeColors.border }]}>
              <Text style={[styles.scoreTitle, { color: themeColors.textPrimary }]}>Base Distance Scores</Text>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreLabel, { color: themeColors.p1Shades[0] }]}>You:</Text>
                <Text style={[styles.scoreValue, { color: themeColors.textPrimary }]}>
                  {dots.filter((d) => d.player === 1 && d.isAlive).reduce((sum, d) => sum + (14 - d.currentPos.r), 0)} pts
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreLabel, { color: themeColors.p2Shades[0] }]}>Bot:</Text>
                <Text style={[styles.scoreValue, { color: themeColors.textPrimary }]}>
                  {dots.filter((d) => d.player === 2 && d.isAlive).reduce((sum, d) => sum + d.currentPos.r, 0)} pts
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.overlayButton, { backgroundColor: themeColors.accent }]}
              onPress={resetGame}
              activeOpacity={0.8}
            >
              <Text style={styles.overlayButtonText}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.overlayButtonSecondary, { borderColor: themeColors.border }]}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Text style={[styles.overlayButtonSecondaryText, { color: themeColors.textPrimary }]}>Go to Menu</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
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
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    position: 'relative',
  },
  errorBanner: {
    position: 'absolute',
    top: 8,
    zIndex: 999,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: '90%',
    alignItems: 'center',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '700',
  },
  bottomContainer: {
    width: '92%',
    height: Dimensions.get('window').height < 750 ? 80 : 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  thinkingCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
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
  overlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  overlayCard: {
    width: '88%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
  },
  overlaySubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  overlayTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  overlayDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  overlayScores: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  scoreTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  overlayButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  overlayButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overlayButtonSecondary: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  overlayButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
