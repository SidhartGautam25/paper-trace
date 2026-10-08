import React from 'react';
import { G, Path } from 'react-native-svg';
import { Point } from '../../types/game';
import { cellToPixel, hexPolygonPath } from '../../engine/geometry';

export interface HexChainCell {
  point: Point;
  /** Lighter fill for the end of a trail. Black rim and white ring stay the same. */
  fill?: string;
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
   * threat: a possible move that cuts or lands on an opponent.
   */
  variant?: 'trail' | 'hint' | 'threat';
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

  if (variant === 'hint' || variant === 'threat') {
    const threat = variant === 'threat';
    return (
      <G>
        {cells.map((cell, index) => {
          const { x, y } = cellToPixel(cell.point, hexSize, offsetX, offsetY);
          const isLast = index === cells.length - 1;
          return (
            <G key={`hint_${cell.point.r}_${cell.point.c}`}>
              <Path
                d={hexPolygonPath(x, y, hexSize * 0.72)}
                fill={threat ? '#F59E0B' : color}
                fillOpacity={threat ? 0.55 : 0.22}
                stroke={threat ? '#B45309' : color}
                strokeOpacity={0.98}
                strokeWidth={threat ? Math.max(2.2, hexSize * 0.12) : Math.max(1.6, hexSize * 0.09)}
                strokeDasharray={
                  threat
                    ? undefined
                    : `${Math.max(3, hexSize * 0.22)} ${Math.max(2, hexSize * 0.14)}`
                }
              />
              {threat && isLast ? (
                <Path
                  d={hexPolygonPath(x, y, hexSize * 0.28)}
                  fill="#7C2D12"
                />
              ) : null}
            </G>
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
            <Path d={hexPolygonPath(x, y, fillRadius)} fill={cell.fill ?? color} />
          </G>
        );
      })}
    </G>
  );
};
