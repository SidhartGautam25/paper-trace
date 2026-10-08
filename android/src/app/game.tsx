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
import { Direction } from '../types/game';
import { parseCharacterLoadout } from '../constants/characters';
import { CollectionPopup } from '../components/ui/CollectionPopup';
import { formatWalletSummary } from '../utils/wallet';
import { GRID_CONFIG } from '../constants/board';
import { getLevelById, getPlayerLoadoutForLevel, getBotLoadoutForLevel, getBlackBoxesForLevel } from '../constants/levels';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    levelId?: string;
    difficulty?: string;
    themeId?: string;
    killEffect?: string;
    lines?: string;
    p1DotColor?: string;
    p1LineColor?: string;
    p2DotColor?: string;
    p2LineColor?: string;
    characters?: string;
  }>();
  const insets = useSafeAreaInsets();
  
  // Declarative Level Setup
  const levelNum = params.levelId ? parseInt(params.levelId, 10) : 1;
  const activeLevel = getLevelById(isNaN(levelNum) ? 1 : levelNum);

  // Difficulty is decided declaratively from level config, with param override if provided
  const difficulty = (params.difficulty === 'easy' || params.difficulty === 'medium' || params.difficulty === 'hard')
    ? params.difficulty
    : activeLevel.difficulty;

  const themeId = params.themeId || 'cyber-neon';
  const killEffect = (params.killEffect === 'collapse' || params.killEffect === 'explode' || params.killEffect === 'dissolve' || params.killEffect === 'monster' || params.killEffect === 'hammer' || params.killEffect === 'burn' || params.killEffect === 'firecracker')
    ? params.killEffect
    : 'collapse';

  // Find theme details
  const activeTheme = GAME_THEMES.find((t) => t.id === themeId) || GAME_THEMES[0];
  const themeColors = activeTheme.colors;

  // Custom Colors
  const p1DotColor = params.p1DotColor || themeColors.p1Shades[0];
  const p1LineColor = params.p1LineColor || themeColors.p1Shades[0];
  const p2DotColor = params.p2DotColor || themeColors.p2Shades[0];
  const p2LineColor = params.p2LineColor || themeColors.p2Shades[0];

  // Custom Lines & Loadouts
  const selectedLines = params.lines ? params.lines.split(',') : ['solid', 'dotted', 'glow'];
  const characterLoadout = params.characters
    ? parseCharacterLoadout(params.characters)
    : getPlayerLoadoutForLevel(activeLevel);
  const botLoadout = getBotLoadoutForLevel(activeLevel);
  const blackBoxes = getBlackBoxesForLevel(activeLevel);

  // Layout Measurement state for percentage-wise dynamic allocation
  const [boardLayout, setBoardLayout] = useState<{ width: number; height: number } | null>(null);

  // Initialize session with declarative level configs
  const {
    dots,
    player1Tokens,
    player2Tokens,
    activePlayer,
    winner,
    historyLogs,
    currencyRegions,
    boardFeatures,
    matchEarnings,
    selectedDotId,
    selectedToken,
    selectedDirection,
    activeNotification,
    dismissNotification,
    selectDot,
    selectToken,
    selectDirection,
    executeMove,
    resetGame,
  } = usePaperSession(difficulty, characterLoadout, botLoadout, blackBoxes);

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

  const handleExecute = (dir: Direction, dotId: string) => {
    setErrorMsg(null);
    const result = executeMove(dir, dotId);
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
      <View style={{ height: Math.max(insets.top, 8) + 32, backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={[styles.backText, { color: themeColors.textSecondary }]}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: themeColors.textPrimary, fontSize: 15, fontWeight: '700' }}>
          {activeLevel.name}: {activeLevel.title}
        </Text>
        <Text style={{ color: themeColors.textSecondary, fontSize: 11, fontWeight: '500' }}>
          {activeLevel.description}
        </Text>
      </View>
      <StatusBar
        barStyle={activeTheme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.cardBackground}
      />
      
      <View style={styles.flexContainer}>
        {/* Header HUD Section */}
        <View style={styles.hudSection}>
          <TokenPicker
            tokens={player2Tokens}
            selectedToken={null}
            onSelectToken={() => {}}
            themeColors={themeColors}
            interactive={false}
          />
        </View>

        {/* Board Canvas Section with dynamic measurement */}
        <View 
          style={styles.boardSection}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setBoardLayout({ width, height });
          }}
        >
          {errorMsg && (
            <View style={[styles.errorBanner, { borderColor: '#EF4444', backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          {boardLayout && (
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
              p1DotColor={p1DotColor}
              p1LineColor={p1LineColor}
              p2DotColor={p2DotColor}
              p2LineColor={p2LineColor}
              selectedLines={selectedLines}
              characterLoadout={characterLoadout}
              currencyRegions={currencyRegions}
              boardFeatures={boardFeatures}
              blackBoxes={blackBoxes}
              maxHeight={boardLayout.height}
              maxWidth={boardLayout.width}
            />
          )}
        </View>

        {/* Bottom Panel Section */}
        <View style={[styles.bottomSection, { marginBottom: isThreeButtonNav ? 4 : Math.max(insets.bottom, 8) }]}>
          <TokenPicker
            tokens={player1Tokens}
            selectedToken={selectedToken}
            onSelectToken={selectToken}
            themeColors={{
              ...themeColors,
              player1Ink: p1DotColor,
              player1InkLight: p1DotColor + '33',
            }}
            disabled={activePlayer !== 1 || !!winner || selectedDotId === null}
          />
        </View>
      </View>

      <CollectionPopup
        notification={activeNotification}
        themeColors={themeColors}
        onDismiss={dismissNotification}
      />

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
            <Text style={[styles.overlaySubtitle, { color: themeColors.textSecondary }]}>
              {activeLevel.name} • {activeLevel.title}
            </Text>
            <Text style={[styles.overlayTitle, { color: winner === 1 ? themeColors.p1Shades[0] : '#EF4444' }]}>
              {winner === 1 ? '🎉 VICTORY' : '💀 DEFEAT'}
            </Text>
            <Text style={[styles.overlayDesc, { color: themeColors.textSecondary }]}>
              {winner === 1
                ? 'All 4 opponent dots eliminated!'
                : 'All 4 of your dots were eliminated.'}
            </Text>

            <View style={[styles.overlayScores, { borderColor: themeColors.border }]}>
              <Text style={[styles.scoreTitle, { color: themeColors.textPrimary }]}>Dots Remaining</Text>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreLabel, { color: themeColors.p1Shades[0] }]}>Player Alive:</Text>
                <Text style={[styles.scoreValue, { color: themeColors.textPrimary }]}>
                  {dots.filter((d) => d.player === 1 && d.isAlive).length} / 4
                </Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreLabel, { color: themeColors.p2Shades[0] }]}>Bot Alive:</Text>
                <Text style={[styles.scoreValue, { color: themeColors.textPrimary }]}>
                  {dots.filter((d) => d.player === 2 && d.isAlive).length} / 4
                </Text>
              </View>
              {matchEarnings && (matchEarnings.gold > 0 || matchEarnings.silver > 0 || matchEarnings.money > 0) && (
                <>
                  <Text style={[styles.scoreTitle, { color: themeColors.textPrimary, marginTop: 10 }]}>Treasure Collected</Text>
                  <Text style={[styles.scoreValue, { color: themeColors.textPrimary, textAlign: 'center' }]}>
                    {formatWalletSummary(matchEarnings)}
                  </Text>
                </>
              )}
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
              <Text style={[styles.overlayButtonSecondaryText, { color: themeColors.textPrimary }]}>Level Select</Text>
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
  flexContainer: {
    flex: 1,
    width: '100%',
  },
  hudSection: {
    width: '100%',
    flexShrink: 0,
  },
  boardSection: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
    position: 'relative',
  },
  bottomSection: {
    width: '100%',
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    position: 'absolute',
    left: 10,
    bottom: 0,
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 20,
    fontWeight: '700',
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
