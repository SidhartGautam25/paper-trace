import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayerWallet } from '../../types/game';

interface TreasuryBarProps {
  matchEarnings: PlayerWallet;
  themeColors: {
    cardBackground: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
  };
}

export const TreasuryBar: React.FC<TreasuryBarProps> = ({ matchEarnings, themeColors }) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border },
      ]}
    >
      <Text style={[styles.title, { color: themeColors.textSecondary }]}>YOUR TREASURY</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.coinEmoji}>🪙</Text>
          <Text style={[styles.value, { color: '#FFB900' }]}>{matchEarnings.gold}</Text>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Gold</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
        <View style={styles.item}>
          <Text style={styles.coinEmoji}>🥈</Text>
          <Text style={[styles.value, { color: '#C8C8C8' }]}>{matchEarnings.silver}</Text>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Silver</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
        <View style={styles.item}>
          <Text style={styles.coinEmoji}>💵</Text>
          <Text style={[styles.value, { color: '#4ADE80' }]}>{matchEarnings.money}</Text>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>Coins</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    minWidth: 56,
  },
  coinEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
  },
});
