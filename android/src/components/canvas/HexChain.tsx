import React from 'react';
import { G, Path } from 'react-native-svg';
import { Point } from '../../types/game';
import { cellToPixel, hexPolygonPath } from '../../engine/geometry';

export interface HexChainCell {
  point: Point;
  /** Fill inside the white ring (head uses character color, body uses player blue/red). */
  fill?: string;
  /** Head hex uses a double white ring; body uses a single solid ring. */
  isHead?: boolean;
}

interface HexChainProps {
  cells: HexChainCell[];
  color: string;
  hexSize: number;
  offsetX: number;
  offsetY: number;
  /**
   * trail: black rim, white ring(s), player/character fill.
   * hint: pale dashed hexes, kept visually separate from a real line.
   * threat: full trail-style hexes in kill colors (drawn above real trails).
   */
  variant?: 'trail' | 'hint' | 'threat';
  /** Black outer rim on trail hexes. */
  borderColor?: string;
}

export const KILL_HINT_BORDER = '#FF4D00';
export const KILL_HINT_FILL = '#FFE94A';

export function TrailHex({
  x,
  y,
  hexSize,
  fill,
  borderColor,
  isHead,
}: {
  x: number;
  y: number;
  hexSize: number;
  fill: string;
  borderColor: string;
  isHead: boolean;
}) {
  const rimRadius = hexSize * (isHead ? 0.92 : 0.9);
  const fillRadius = hexSize * (isHead ? 0.52 : 0.62);

  return (
    <G>
      <Path d={hexPolygonPath(x, y, rimRadius)} fill={borderColor} />
      {isHead ? (
        <G>
          <Path d={hexPolygonPath(x, y, hexSize * 0.84)} fill="#FFFFFF" />
          <Path d={hexPolygonPath(x, y, hexSize * 0.72)} fill={borderColor} />
          <Path d={hexPolygonPath(x, y, hexSize * 0.64)} fill="#FFFFFF" />
        </G>
      ) : (
        <Path d={hexPolygonPath(x, y, hexSize * 0.76)} fill="#FFFFFF" />
      )}
      <Path d={hexPolygonPath(x, y, fillRadius)} fill={fill} />
    </G>
  );
}

export const HexChain: React.FC<HexChainProps> = ({
  cells,
  color,
  hexSize,
  offsetX,
  offsetY,
  variant = 'trail',
  borderColor = '#000000',
}) => {
  if (cells.length === 0) return null;

  if (variant === 'threat') {
    const last = cells.length - 1;
    return (
      <G>
        {cells.map((cell, index) => {
          const { x, y } = cellToPixel(cell.point, hexSize, offsetX, offsetY);
          const isHead = index === last;
          return (
            <G key={`kill_${cell.point.r}_${cell.point.c}`}>
              <TrailHex
                x={x}
                y={y}
                hexSize={hexSize}
                fill={cell.fill ?? KILL_HINT_FILL}
                borderColor={KILL_HINT_BORDER}
                isHead={isHead}
              />
            </G>
          );
        })}
      </G>
    );
  }

  if (variant === 'hint') {
    return (
      <G>
        {cells.map((cell) => {
          const { x, y } = cellToPixel(cell.point, hexSize, offsetX, offsetY);
          return (
            <G key={`hint_${cell.point.r}_${cell.point.c}`}>
              <Path
                d={hexPolygonPath(x, y, hexSize * 0.72)}
                fill={color}
                fillOpacity={0.22}
                stroke={color}
                strokeOpacity={0.98}
                strokeWidth={Math.max(1.6, hexSize * 0.09)}
                strokeDasharray={`${Math.max(3, hexSize * 0.22)} ${Math.max(2, hexSize * 0.14)}`}
              />
            </G>
          );
        })}
      </G>
    );
  }

  return (
    <G>
      {cells.map((cell) => {
        const { x, y } = cellToPixel(cell.point, hexSize, offsetX, offsetY);
        const fill = cell.fill ?? color;
        return (
          <G key={`body_${cell.point.r}_${cell.point.c}`}>
            <TrailHex
              x={x}
              y={y}
              hexSize={hexSize}
              fill={fill}
              borderColor={borderColor}
              isHead={cell.isHead === true}
            />
          </G>
        );
      })}
    </G>
  );
};
