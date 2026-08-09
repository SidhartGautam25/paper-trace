import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { TokenPool } from '../../types/game';

interface PlayerStatusBarProps {
  activePlayer: 1 | 2;
  winner: 1 | 2 | null;
  difficulty: 'easy' | 'medium' | 'hard';
  isAiThinking: boolean;
  onReset: () => void;
  onBack: () => void;
  themeColors: any;
  player1Tokens: TokenPool;
  player2Tokens: TokenPool;
}

export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
  activePlayer,
  winner,
  difficulty,
  isAiThinking,
  onReset,
  onBack,
  themeColors,
  player1Tokens,
  player2Tokens,
}) => {
  const formatDiff = (diff: string) => {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground, borderBottomColor: themeColors.border }]}>
      {/* Top Row: Back Navigation & Restart */}
      <View style={styles.topRow}>
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
          <Text style={[styles.resetText, { color: themeColors.accent }]}>Reset Game</Text>
        </TouchableOpacity>
      </View>

      {/* Info Row: Displays Selected Difficulty level */}
      <View style={styles.infoRow}>
        <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
          Opponent: <Text style={{ color: themeColors.p2Shades[0], fontWeight: '700' }}>{formatDiff(difficulty)} Bot</Text>
        </Text>

        {/* Opponent's remaining tokens display */}
        <View style={styles.opponentTokensRow}>
          <Text style={[styles.opponentTokensLabel, { color: themeColors.textSecondary }]}>
            {activePlayer === 1 ? 'Bot' : 'Your'} Pool:
          </Text>
          <View style={styles.tokenBadgesContainer}>
            {[1, 2, 3, 4, 5].map((val) => {
              const opponentTokens = activePlayer === 1 ? player2Tokens : player1Tokens;
              const count = opponentTokens[val] || 0;
              return (
                <View
                  key={`opp_tok_${val}`}
                  style={[
                    styles.tokenBadge,
                    {
                      borderColor: count > 0 ? themeColors.border : themeColors.border + '44',
                      backgroundColor: count > 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.01)',
                      opacity: count > 0 ? 1 : 0.45,
                    },
                  ]}
                >
                  <Text style={[styles.tokenBadgeText, { color: count > 0 ? themeColors.textPrimary : themeColors.textSecondary }]}>
                    {val}
                  </Text>
                  <Text style={[styles.tokenCountText, { color: count > 0 ? themeColors.accent : themeColors.textSecondary }]}>
                    x{count}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
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
    padding: Dimensions.get('window').height < 750 ? 10 : 16,
    borderBottomWidth: 1.5,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Dimensions.get('window').height < 750 ? 4 : 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
  },
  navText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  resetButton: {
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoRow: {
    marginBottom: Dimensions.get('window').height < 750 ? 4 : 8,
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
  opponentTokensRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Dimensions.get('window').height < 750 ? 4 : 6,
  },
  opponentTokensLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  tokenBadgesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  tokenBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  tokenCountText: {
    fontSize: 9,
    fontWeight: '800',
  },
});
