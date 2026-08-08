import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Direction } from '../../types/game';

interface DirectionPadProps {
  selectedDirection: Direction | null;
  onSelectDirection: (dir: Direction) => void;
  themeColors: any;
}

export const DirectionPad: React.FC<DirectionPadProps> = ({
  selectedDirection,
  onSelectDirection,
  themeColors,
}) => {
  const directions: { dir: Direction | null; label: string }[] = [
    { dir: 'NW', label: '↖' },
    { dir: 'N', label: '↑' },
    { dir: 'NE', label: '↗' },
    { dir: 'W', label: '←' },
    { dir: null, label: '✛' }, // Decorative center anchor
    { dir: 'E', label: '→' },
    { dir: 'SW', label: '↙' },
    { dir: 'S', label: '↓' },
    { dir: 'SE', label: '↘' },
  ];

  return (
    <View style={[styles.container, { borderColor: themeColors.border }]}>
      <View style={styles.grid}>
        {directions.map((item, index) => {
          if (item.dir === null) {
            return (
              <View
                key={`center_${index}`}
                style={[
                  styles.cell,
                  styles.centerCell,
                  { backgroundColor: themeColors.cardBackground },
                ]}
              >
                <Text style={[styles.centerText, { color: themeColors.gridDot }]}>
                  {item.label}
                </Text>
              </View>
            );
          }

          const isSelected = selectedDirection === item.dir;
          return (
            <TouchableOpacity
              key={`dir_${item.dir}`}
              style={[
                styles.cell,
                {
                  backgroundColor: isSelected ? themeColors.player1Ink : themeColors.cardBackground,
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => onSelectDirection(item.dir!)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.arrowText,
                  {
                    color: isSelected ? '#FFFFFF' : themeColors.textPrimary,
                    fontWeight: isSelected ? '700' : 'normal',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 90, // Circular border outline
    padding: 6,
    alignSelf: 'center',
    width: 172,
    height: 172,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F6', // paper contrast background
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 156,
    height: 156,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    width: 48,
    height: 48,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24, // circular buttons
    borderWidth: 1,
    elevation: 1,
  },
  centerCell: {
    borderWidth: 0,
    elevation: 0,
  },
  arrowText: {
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
  },
  centerText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
