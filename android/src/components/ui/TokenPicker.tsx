import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { TokenPool } from '../../types/game';

interface TokenPickerProps {
  tokens: TokenPool;
  selectedToken: number | null;
  onSelectToken: (value: number) => void;
  themeColors: any;
  disabled?: boolean;
}

export const TokenPicker: React.FC<TokenPickerProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  themeColors,
  disabled = false,
}) => {
  const tokenValues = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {tokenValues.map((val) => {
          const count = tokens[val] || 0;
          const isSelected = selectedToken === val;
          const isDisabled = count === 0 || disabled;

          return (
            <TouchableOpacity
              key={`token_${val}`}
              disabled={isDisabled}
              style={[
                styles.tokenCard,
                {
                  backgroundColor: isSelected
                    ? themeColors.player1Ink
                    : themeColors.cardBackground,
                  borderColor: isSelected ? themeColors.player1Ink : themeColors.border,
                  opacity: isDisabled ? 0.35 : 1.0,
                },
              ]}
              onPress={() => onSelectToken(val)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tokenValue,
                  { color: isSelected ? '#FFFFFF' : themeColors.textPrimary },
                ]}
              >
                {val}
              </Text>
              
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(255, 255, 255, 0.25)'
                      : themeColors.player1InkLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: isSelected ? '#FFFFFF' : themeColors.player1Ink },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    width: '100%',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  tokenCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: Dimensions.get('window').height < 750 ? 6 : 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  tokenValue: {
    fontSize: Dimensions.get('window').height < 750 ? 16 : 20,
    fontWeight: '700',
    marginBottom: Dimensions.get('window').height < 750 ? 2 : 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
