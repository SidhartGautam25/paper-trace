import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Circle, G, Rect } from 'react-native-svg';
import { Dot, Direction, Point, CharacterId, CurrencyRegion, BoardFeatureInstance } from '../../types/game';
import { GRID_CONFIG } from '../../constants/board';
import { LineSegment } from './LineSegment';
import { BaseDotMarker } from './BaseDotMarker';
import { BoardRegionLayer } from './BoardRegionLayer';
import { TrapPointMarkers } from './TrapPointMarkers';
import { getDestination, isWithinBounds } from '../../engine/geometry';
import { canLandAt } from '../../engine/boardFeatureEngine';
import { getCharacterForDot, DotShape } from '../../constants/characters';
import { getAllTrapPoints, getVisibleTrailSegments } from '../../engine/characterEngine';

interface GridCanvasProps {
  dots: Dot[];
  activePlayer: 1 | 2;
  selectedDotId: string | null;
  selectedToken: number | null;
  selectedDirection: Direction | null;
  onSelectDot: (dotId: string) => void;
  themeColors: any;
  killEffect: 'collapse' | 'explode' | 'dissolve' | 'monster' | 'hammer' | 'burn' | 'firecracker';
  onSelectDirection: (dir: Direction) => void;
  onGestureEnd: (dir: Direction, dotId: string) => void;
  onGestureStart?: () => void;
  p1DotColor: string;
  p1LineColor: string;
  p2DotColor: string;
  p2LineColor: string;
  selectedLines: string[];
  characterLoadout: [CharacterId, CharacterId, CharacterId];
  currencyRegions: CurrencyRegion[];
  boardFeatures: BoardFeatureInstance[];
  maxHeight: number;
  maxWidth: number;
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
  p1DotColor,
  p1LineColor,
  p2DotColor,
  p2LineColor,
  selectedLines,
  characterLoadout,
  currencyRegions,
  boardFeatures,
  maxHeight,
  maxWidth,
}) => {
  const insets = useSafeAreaInsets();

  // Compute available space dynamically from flex measured dimensions
  const maxBoardHeight = maxHeight - 16;
  const maxBoardWidth = maxWidth - 16;

  const cellWidthLimit = (maxBoardWidth - 40) / (GRID_CONFIG.COLS - 1);
  const cellHeightLimit = (maxBoardHeight - 40) / (GRID_CONFIG.ROWS - 1);
  const cellSize = Math.max(22, Math.min(GRID_CONFIG.CELL_SIZE, cellWidthLimit, cellHeightLimit));

  const offsetX = 20;
  const offsetY = 20;

  const boardWidth = (GRID_CONFIG.COLS - 1) * cellSize + offsetX * 2;
  const boardHeight = (GRID_CONFIG.ROWS - 1) * cellSize + offsetY * 2;

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const gestureDirRef = useRef<Direction | null>(null);
  const gestureDotIdRef = useRef<string | null>(null);

  const findPlayerDotAtLocal = (localX: number, localY: number): Dot | null => {
    const hitRadius = 40;
    for (const dot of dots) {
      if (!dot.isAlive || dot.player !== activePlayer) continue;
      const cx = dot.currentPos.c * cellSize + offsetX;
      const cy = dot.currentPos.r * cellSize + offsetY;
      const dx = localX - cx;
      const dy = localY - cy;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) return dot;
    }
    return null;
  };

  // Helper to resolve 8-way swipe direction from coordinates delta
  const getGestureDirection = (dx: number, dy: number): Direction | null => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 8) return null;

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

  const handleStart = (localX: number, localY: number) => {
    if (selectedToken === null) return;

    let dotId = selectedDotId;
    const hitDot = findPlayerDotAtLocal(localX, localY);
    if (hitDot) {
      dotId = hitDot.id;
      onSelectDot(hitDot.id);
    }
    if (!dotId) return;

    gestureDotIdRef.current = dotId;
    gestureDirRef.current = null;
    setDragStart({ x: localX, y: localY });
    onGestureStart?.();
  };

  const handleMove = (localX: number, localY: number) => {
    if (!gestureDotIdRef.current || selectedToken === null || !dragStart) return;
    const dx = localX - dragStart.x;
    const dy = localY - dragStart.y;

    const dir = getGestureDirection(dx, dy);
    if (dir) {
      gestureDirRef.current = dir;
      onSelectDirection(dir);
    }
  };

  const handleEnd = () => {
    const dir = gestureDirRef.current;
    const dotId = gestureDotIdRef.current;
    gestureDirRef.current = null;
    gestureDotIdRef.current = null;
    setDragStart(null);
    if (dir && dotId) {
      onGestureEnd(dir, dotId);
    }
  };

  const canSwipeToMove = selectedToken !== null && (selectedDotId !== null || activePlayer === 1);

  // Direct Event Mappers for both Touch (mobile) and Mouse (desktop web)
  const onTouchStartLocal = (e: any) => {
    const touch = e.nativeEvent.touches?.[0];
    if (touch) {
      handleStart(touch.locationX, touch.locationY);
    }
  };

  const onTouchMoveLocal = (e: any) => {
    const touch = e.nativeEvent.touches?.[0];
    if (touch) {
      handleMove(touch.locationX, touch.locationY);
    }
  };

  const onTouchEndLocal = () => {
    handleEnd();
  };

  const onMouseDownLocal = (e: any) => {
    if (e.nativeEvent.button !== 0) return;
    handleStart(e.nativeEvent.locationX, e.nativeEvent.locationY);
  };

  const onMouseMoveLocal = (e: any) => {
    handleMove(e.nativeEvent.locationX, e.nativeEvent.locationY);
  };

  const onMouseUpLocal = () => {
    handleEnd();
  };

  // Retrieve color from character definition (per dot slot)
  const getDotColor = (dotId: string): string => {
    return getCharacterForDot(dotId, characterLoadout).dotColor;
  };

  const getLineColor = (dotId: string): string => {
    return getCharacterForDot(dotId, characterLoadout).lineColor;
  };

  const getLineStyleForDot = (dotId: string): string => {
    return getCharacterForDot(dotId, characterLoadout).lineStyle;
  };

  const getShapeForDot = (dotId: string): DotShape => {
    return getCharacterForDot(dotId, characterLoadout).shape;
  };

  const trapPoints = getAllTrapPoints(dots);

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
    const baseColor = getLineColor(selectedDotId);

    return (
      <G opacity={0.45}>
        {directions.map((dir) => {
          const endPos = getDestination(startPos, dir, selectedToken);
          if (!isWithinBounds(endPos)) return null;
          if (!canLandAt(endPos, selectedDotId, dots, boardFeatures)) return null;

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
    const canLand = inBounds && canLandAt(endPos, selectedDotId, dots, boardFeatures);
    const baseColor = getLineColor(selectedDotId);
    const strokeColor = canLand ? baseColor : '#EF4444';
    const lineStyle = getLineStyleForDot(selectedDotId);

    return (
      <G>
        {lineStyle === 'glow' ? (
          <G>
            <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={8} strokeOpacity={0.2} />
            <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={2.5} />
          </G>
        ) : lineStyle === 'dotted' ? (
          <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={3} strokeDasharray="1, 5" />
        ) : (
          <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={2.5} strokeDasharray="4, 4" />
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
      onStartShouldSetResponder={() => selectedToken !== null}
      onMoveShouldSetResponder={() => selectedToken !== null}
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

        {/* Region zones (treasure + special properties) */}
        <BoardRegionLayer
          currencyRegions={currencyRegions}
          boardFeatures={boardFeatures}
          cellSize={cellSize}
          offsetX={offsetX}
          offsetY={offsetY}
        />

        {/* Corner tactical overlays */}
        {renderCornerCrosshairs()}

        {/* Grid dots */}
        {gridIntersections}

        <TrapPointMarkers
          trapPoints={trapPoints}
          cellSize={cellSize}
          offsetX={offsetX}
          offsetY={offsetY}
        />

        {/* Renders line trails using character styles */}
        {dots.map((dot) => {
          if (!dot) return null;
          const lineColor = getLineColor(dot.id);
          const charLineStyle = getLineStyleForDot(dot.id);
          const visibleTrail = getVisibleTrailSegments(dot);
          return visibleTrail.map((segment, idx) => (
            <LineSegment
              key={segment.id}
              segment={segment}
              color={lineColor}
              index={idx}
              historyLength={visibleTrail.length}
              cellSize={cellSize}
              offsetX={offsetX}
              offsetY={offsetY}
              selectedLines={[charLineStyle]}
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
          const color = getDotColor(dot.id);
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
              shape={getShapeForDot(dot.id)}
              boardFeatures={boardFeatures}
            />
          );
        })}
      </Svg>

      {/* Dot taps — disabled while swiping so gestures pass through to the board */}
      <View
        style={[StyleSheet.absoluteFill, { pointerEvents: canSwipeToMove ? 'none' : 'box-none' }]}
      >
        {dots.map((dot) => {
          if (!dot || !dot.isAlive || dot.player !== activePlayer) return null;
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
