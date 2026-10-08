import React from 'react';
import { G, Path } from 'react-native-svg';
import { Point } from '../../types/game';
import { cellToPixel, hexPolygonPath } from '../../engine/geometry';

export interface HexChainCell {
  point: Point;
  opacity?: number;
}

interface HexChainProps {
  cells: HexChainCell[];
  color: string;
  hexSize: number;
  offsetX: number;
  offsetY: number;
  /**
   * trail: every hex has a thin black rim and a white ring on all six sides.
   * hint: pale dashed hexes, kept visually separate from a real line.
   */
  variant?: 'trail' | 'hint';
}

export const HexChain: React.FC<HexChainProps> = ({
  cells,
  color,
  hexSize,
  offsetX,
  offsetY,
  variant = 'trail',
}) => {
  if (cells.length === 0) return null;

  if (variant === 'hint') {
    return (
      <G>
        {cells.map((cell) => {
          const { x, y } = cellToPixel(cell.point, hexSize, offsetX, offsetY);
          return (
            <Path
              key={`hint_${cell.point.r}_${cell.point.c}`}
              d={hexPolygonPath(x, y, hexSize * 0.72)}
              fill={color}
              fillOpacity={0.22}
              stroke={color}
              strokeOpacity={0.95}
              strokeWidth={Math.max(1.6, hexSize * 0.09)}
              strokeDasharray={`${Math.max(3, hexSize * 0.22)} ${Math.max(2, hexSize * 0.14)}`}
            />
          );
        })}
      </G>
    );
  }

  // Slightly inside the cell so neighboring hexes keep their own rims.
  const blackRadius = hexSize * 0.9;
  const whiteRadius = hexSize * 0.76;
  const fillRadius = hexSize * 0.62;

  return (
    <G>
      {cells.map((cell) => {
        const { x, y } = cellToPixel(cell.point, hexSize, offsetX, offsetY);
        return (
          <G key={`body_${cell.point.r}_${cell.point.c}`}>
            <Path d={hexPolygonPath(x, y, blackRadius)} fill="#1A1A1A" />
            <Path d={hexPolygonPath(x, y, whiteRadius)} fill="#FFFFFF" />
            <Path d={hexPolygonPath(x, y, fillRadius)} fill={color} />
          </G>
        );
      })}
    </G>
  );
};
