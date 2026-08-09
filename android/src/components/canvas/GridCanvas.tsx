import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Circle, G, Rect } from 'react-native-svg';
import { Dot, Direction, Point } from '../../types/game';
import { GRID_CONFIG } from '../../constants/board';
import { LineSegment } from './LineSegment';
import { BaseDotMarker } from './BaseDotMarker';
import { getDestination, isWithinBounds } from '../../engine/geometry';

interface GridCanvasProps {
  dots: Dot[];
  activePlayer: 1 | 2;
  selectedDotId: string | null;
  selectedToken: number | null;
  selectedDirection: Direction | null;
  onSelectDot: (dotId: string) => void;
  themeColors: any;
  killEffect: 'collapse' | 'explode' | 'dissolve' | 'monster' | 'hammer';
  onSelectDirection: (dir: Direction) => void;
  onGestureEnd: () => void;
  onGestureStart?: () => void;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  dots,
  activePlayer,
  selectedDotId,
  selectedToken,
  selectedDirection,
  onSelectDot,
  themeColors,
  killEffect,
  onSelectDirection,
  onGestureEnd,
  onGestureStart,
}) => {
  const cellSize = GRID_CONFIG.CELL_SIZE;
  const offsetX = 20;
  const offsetY = 20;

  const boardWidth = (GRID_CONFIG.COLS - 1) * cellSize + offsetX * 2;
  const boardHeight = (GRID_CONFIG.ROWS - 1) * cellSize + offsetY * 2;

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Helper to resolve 8-way swipe direction from coordinates delta
  const getGestureDirection = (dx: number, dy: number): Direction | null => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 15) return null; // Prevent jitter on minor drags

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) {
      angle += 360;
    }

    if (angle >= 337.5 || angle < 22.5) return 'E';
    if (angle >= 22.5 && angle < 67.5) return 'SE';
    if (angle >= 67.5 && angle < 112.5) return 'S';
    if (angle >= 112.5 && angle < 157.5) return 'SW';
    if (angle >= 157.5 && angle < 202.5) return 'W';
    if (angle >= 202.5 && angle < 247.5) return 'NW';
    if (angle >= 247.5 && angle < 292.5) return 'N';
    return 'NE';
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (!selectedDotId || selectedToken === null) return;
    setDragStart({ x: clientX, y: clientY });
    onGestureStart?.();
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!selectedDotId || selectedToken === null || !dragStart) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;

    const dir = getGestureDirection(dx, dy);
    if (dir) {
      onSelectDirection(dir);
    }
  };

  const handleEnd = () => {
    if (!dragStart) return;
    setDragStart(null);
    if (selectedDirection) {
      onGestureEnd();
    }
  };

  // Direct Event Mappers for both Touch (mobile) and Mouse (desktop web)
  const onTouchStartLocal = (e: any) => {
    const touch = e.nativeEvent.touches?.[0];
    if (touch) {
      handleStart(touch.pageX, touch.pageY);
    }
  };

  const onTouchMoveLocal = (e: any) => {
    const touch = e.nativeEvent.touches?.[0];
    if (touch) {
      handleMove(touch.pageX, touch.pageY);
    }
  };

  const onTouchEndLocal = () => {
    handleEnd();
  };

  const onMouseDownLocal = (e: any) => {
    // Left-click dragging only
    if (e.nativeEvent.button !== 0) return;
    handleStart(e.nativeEvent.clientX, e.nativeEvent.clientY);
  };

  const onMouseMoveLocal = (e: any) => {
    handleMove(e.nativeEvent.clientX, e.nativeEvent.clientY);
  };

  const onMouseUpLocal = () => {
    handleEnd();
  };

  // Retrieve the custom shade for a specific dot
  const getDotColor = (dotId: string, player: 1 | 2): string => {
    const shades = player === 1 ? themeColors.p1Shades : themeColors.p2Shades;
    if (dotId.endsWith('_1')) return shades[0];
    if (dotId.endsWith('_2')) return shades[1];
    if (dotId.endsWith('_3')) return shades[2];
    return shades[0];
  };

  // Draw modern dark grid alignment guides (subtle lines)
  const gridLines = [];
  // Horizontal guides
  for (let r = 0; r < GRID_CONFIG.ROWS; r++) {
    const y = r * cellSize + offsetY;
    gridLines.push(
      <Line
        key={`h_guide_${r}`}
        x1={offsetX}
        y1={y}
        x2={boardWidth - offsetX}
        y2={y}
        stroke={themeColors.gridLine}
        strokeWidth={1}
      />
    );
  }
  // Vertical guides
  for (let c = 0; c < GRID_CONFIG.COLS; c++) {
    const x = c * cellSize + offsetX;
    gridLines.push(
      <Line
        key={`v_guide_${c}`}
        x1={x}
        y1={offsetY}
        x2={x}
        y2={boardHeight - offsetY}
        stroke={themeColors.gridLine}
        strokeWidth={1}
      />
    );
  }

  // Draw tactical corner crosshairs for premium aesthetic
  const renderCornerCrosshairs = () => {
    const size = 8;
    const padding = 10;
    const corners = [
      { x: offsetX - padding, y: offsetY - padding },
      { x: boardWidth - offsetX + padding, y: offsetY - padding },
      { x: offsetX - padding, y: boardHeight - offsetY + padding },
      { x: boardWidth - offsetX + padding, y: boardHeight - offsetY + padding },
    ];

    return corners.map((corner, idx) => (
      <G key={`corner_${idx}`} opacity={0.35}>
        <Line
          x1={corner.x - size}
          y1={corner.y}
          x2={corner.x + size}
          y2={corner.y}
          stroke={themeColors.textSecondary}
          strokeWidth={1}
        />
        <Line
          x1={corner.x}
          y1={corner.y - size}
          x2={corner.x}
          y2={corner.y + size}
          stroke={themeColors.textSecondary}
          strokeWidth={1}
        />
      </G>
    ));
  };

  // Draw modern glowing grid intersections
  const gridIntersections = [];
  for (let r = 0; r < GRID_CONFIG.ROWS; r++) {
    for (let c = 0; c < GRID_CONFIG.COLS; c++) {
      const cx = c * cellSize + offsetX;
      const cy = r * cellSize + offsetY;
      gridIntersections.push(
        <Circle
          key={`dot_${r}_${c}`}
          cx={cx}
          cy={cy}
          r={3.2}
          fill={themeColors.gridDot}
          opacity={0.45}
        />
      );
    }
  }

  // Draw 8-way tactical move guidelines
  const renderMoveGuides = () => {
    if (!selectedDotId || selectedToken === null) return null;
    const movingDot = dots.find((d) => d.id === selectedDotId);
    if (!movingDot) return null;

    const startPos = movingDot.currentPos;
    const directions: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const baseColor = getDotColor(selectedDotId, 1);

    return (
      <G opacity={0.45}>
        {directions.map((dir) => {
          const endPos = getDestination(startPos, dir, selectedToken);
          if (!isWithinBounds(endPos)) return null;

          const x1 = startPos.c * cellSize + offsetX;
          const y1 = startPos.r * cellSize + offsetY;
          const x2 = endPos.c * cellSize + offsetX;
          const y2 = endPos.r * cellSize + offsetY;

          return (
            <G key={`guide_${dir}`}>
              {/* Thin dashed guide line */}
              <Line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={baseColor}
                strokeWidth={2.0}
                strokeDasharray="4, 4"
              />
              {/* Destination marker ring */}
              <Circle
                cx={x2}
                cy={y2}
                r={5.5}
                fill="none"
                stroke={baseColor}
                strokeWidth={1.5}
              />
            </G>
          );
        })}
      </G>
    );
  };

  // Draw move preview vector (incorporating dot-specific style)
  const renderPreview = () => {
    if (!selectedDotId || selectedToken === null || !selectedDirection) return null;
    const movingDot = dots.find((d) => d.id === selectedDotId);
    if (!movingDot) return null;

    const startPos = movingDot.currentPos;
    const endPos = getDestination(startPos, selectedDirection, selectedToken);

    const x1 = startPos.c * cellSize + offsetX;
    const y1 = startPos.r * cellSize + offsetY;
    const x2 = endPos.c * cellSize + offsetX;
    const y2 = endPos.r * cellSize + offsetY;

    const inBounds = isWithinBounds(endPos);
    
    // Preview uses the moving dot's primary shade or red alert if out-of-bounds
    const baseColor = getDotColor(selectedDotId, 1);
    const strokeColor = inBounds ? baseColor : '#EF4444';
    const dotNumber = selectedDotId.split('_')[1] || '1';

    return (
      <G>
        {/* Trajectory preview path with different styles */}
        {dotNumber === '2' ? (
          <Line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth={3}
            strokeDasharray="1, 5"
          />
        ) : dotNumber === '3' ? (
          <G>
            <Line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={8}
              strokeOpacity={0.2}
            />
            <Line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth={2.5}
            />
          </G>
        ) : (
          <Line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeDasharray="4, 4"
          />
        )}

        {/* Destination end ring */}
        <Circle
          cx={x2}
          cy={y2}
          r={7}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1.5}
        />
        {/* Destination center point */}
        <Circle
          cx={x2}
          cy={y2}
          r={2.5}
          fill={strokeColor}
        />
      </G>
    );
  };

  return (
    <View
      style={[styles.container, { shadowColor: themeColors.shadowColor }]}
      onTouchStart={onTouchStartLocal}
      onTouchMove={onTouchMoveLocal}
      onTouchEnd={onTouchEndLocal}
      // @ts-ignore - Support standard mouse dragging on web platform
      onMouseDown={onMouseDownLocal}
      onMouseMove={onMouseMoveLocal}
      onMouseUp={onMouseUpLocal}
    >
      <Svg width={boardWidth} height={boardHeight}>
        {/* Sleek cyber board background */}
        <Rect
          width={boardWidth}
          height={boardHeight}
          fill={themeColors.boardBackground}
          rx={16}
        />

        {/* Grid lines guides */}
        {gridLines}

        {/* Corner tactical overlays */}
        {renderCornerCrosshairs()}

        {/* Grid dots */}
        {gridIntersections}

        {/* Renders line trails using respective dot shades and line style settings */}
        {dots.map((dot) => {
          if (!dot) return null;
          const color = getDotColor(dot.id, dot.player);
          return dot.history.map((segment, idx) => (
            <LineSegment
              key={segment.id}
              segment={segment}
              color={color}
              index={idx}
              historyLength={dot.history.length}
              cellSize={cellSize}
              offsetX={offsetX}
              offsetY={offsetY}
            />
          ));
        })}

        {/* Trajectory guide lines */}
        {renderMoveGuides()}

        {/* Preview trajectory vector */}
        {renderPreview()}

        {/* Active Player Node Markers */}
        {dots.map((dot) => {
          if (!dot) return null;
          const color = getDotColor(dot.id, dot.player);
          const isSelected = selectedDotId === dot.id;
          return (
            <BaseDotMarker
              key={dot.id}
              dot={dot}
              color={color}
              isSelected={isSelected}
              cellSize={cellSize}
              offsetX={offsetX}
              offsetY={offsetY}
              killEffect={killEffect}
              themeColors={themeColors}
            />
          );
        })}
      </Svg>

      {/* Absolute overlay for reliable cross-platform tap targets */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {dots.map((dot) => {
          if (!dot || !dot.isAlive) return null;
          // Calculate click target center coordinates
          const cx = dot.currentPos.c * cellSize + offsetX;
          const cy = dot.currentPos.r * cellSize + offsetY;

          return (
            <TouchableOpacity
              key={`tap_${dot.id}`}
              style={{
                position: 'absolute',
                left: cx - 26,
                top: cy - 26,
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: 'transparent',
              }}
              onPress={() => onSelectDot(dot.id)}
              activeOpacity={0.65}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginVertical: 12,
    // @ts-ignore
    touchAction: 'none',
  },
});
