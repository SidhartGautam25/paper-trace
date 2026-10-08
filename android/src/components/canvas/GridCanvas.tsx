import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { Dot, Direction, CharacterId, CurrencyRegion, BoardFeatureInstance } from '../../types/game';
import { GRID_CONFIG } from '../../constants/board';
import { HexChain, TrailRing } from './HexChain';
import { BaseDotMarker } from './BaseDotMarker';
import { TrapPointMarkers } from './TrapPointMarkers';
import {
  HEX_DIRECTIONS,
  cellToPixel,
  getCellsAlongPath,
  getDestination,
  hexPolygonPath,
  isWithinBounds,
  pointsEqual,
  walkHex,
} from '../../engine/geometry';
import { canEliminateDot, canLandAt } from '../../engine/boardFeatureEngine';
import { getCharacterForDot, DotShape } from '../../constants/characters';
import { doesTrailCutKillDot, getAllTrapPoints, getVisibleTrailSegments, pathCrossesOwnTrail } from '../../engine/characterEngine';

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
  characterLoadout,
  boardFeatures,
  maxHeight,
  maxWidth,
}) => {
  const insets = useSafeAreaInsets();

  // Compute available space dynamically from flex measured dimensions
  const maxBoardHeight = Math.max(120, maxHeight - 8);
  const maxBoardWidth = Math.max(120, maxWidth - 8);

  const pad = 2;
  const widthUnits = Math.sqrt(3) * (GRID_CONFIG.COLS + 0.5);
  const heightUnits = 1.5 * (GRID_CONFIG.ROWS - 1) + 2;
  const cellSize = Math.max(
    4,
    Math.min((maxBoardWidth - pad * 2) / widthUnits, (maxBoardHeight - pad * 2) / heightUnits)
  );
  const offsetX = pad + (Math.sqrt(3) * cellSize) / 2;
  const offsetY = pad + cellSize;
  const boardWidth = widthUnits * cellSize + pad * 2;
  const boardHeight = heightUnits * cellSize + pad * 2;

  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);
  const gestureDirRef = useRef<Direction | null>(null);
  const gestureDotIdRef = useRef<string | null>(null);

  const findPlayerDotAtLocal = (localX: number, localY: number): Dot | null => {
    const hitRadius = Math.max(28, cellSize * 1.6);
    for (const dot of dots) {
      if (!dot.isAlive || dot.player !== activePlayer) continue;
      const { x: cx, y: cy } = cellToPixel(dot.currentPos, cellSize, offsetX, offsetY);
      const dx = localX - cx;
      const dy = localY - cy;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) return dot;
    }
    return null;
  };

  const sectorAngle: Record<Direction, number> = {
    E: 0,
    SE: 60,
    SW: 120,
    W: 180,
    NW: 240,
    NE: 300,
  };

  const angleGap = (a: number, b: number) => {
    const gap = Math.abs(a - b) % 360;
    return gap > 180 ? 360 - gap : gap;
  };

  // Pointy-top neighbors sit 60° apart. Once a direction locks, it stays until the finger is clearly closer to another.
  const getGestureDirection = (dx: number, dy: number, locked: Direction | null): Direction | null => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 4) return locked;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    let best: Direction = 'E';
    let bestGap = 360;
    for (const dir of HEX_DIRECTIONS) {
      const gap = angleGap(angle, sectorAngle[dir]);
      if (gap < bestGap) {
        bestGap = gap;
        best = dir;
      }
    }

    if (locked && best !== locked && angleGap(angle, sectorAngle[locked]) < bestGap + 18) {
      return locked;
    }
    return best;
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
    dragOriginRef.current = { x: localX, y: localY };
    onGestureStart?.();
  };

  const handleMove = (localX: number, localY: number) => {
    const origin = dragOriginRef.current;
    if (!gestureDotIdRef.current || selectedToken === null || !origin) return;
    const dir = getGestureDirection(localX - origin.x, localY - origin.y, gestureDirRef.current);
    if (dir && dir !== gestureDirRef.current) {
      gestureDirRef.current = dir;
      onSelectDirection(dir);
    }
  };

  const handleEnd = () => {
    const dir = gestureDirRef.current;
    const dotId = gestureDotIdRef.current;
    dragOriginRef.current = null;
    gestureDirRef.current = null;
    gestureDotIdRef.current = null;
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

  const getShapeForDot = (dotId: string): DotShape => {
    return getCharacterForDot(dotId, characterLoadout).shape;
  };

  const ringForShape = (shape: DotShape): TrailRing => {
    if (shape === 'arrow' || shape === 'hexagon') return 'double';
    return 'solid';
  };

  const trapPoints = getAllTrapPoints(dots);

  const hexCells = [];
  for (let r = 0; r < GRID_CONFIG.ROWS; r++) {
    for (let c = 0; c < GRID_CONFIG.COLS; c++) {
      const { x, y } = cellToPixel({ r, c }, cellSize, offsetX, offsetY);
      hexCells.push(
        <Path
          key={`hex_${r}_${c}`}
          d={hexPolygonPath(x, y, cellSize * 0.97)}
          fill="#E4EBF3"
          stroke="#B7C3D1"
          strokeWidth={Math.max(0.8, cellSize * 0.07)}
        />
      );
    }
  }

  const orderedTrailPoints = (dot: Dot) => {
    const ordered: { r: number; c: number }[] = [];
    const seen = new Set<string>();
    const push = (point: { r: number; c: number }) => {
      const key = `${point.r},${point.c}`;
      if (seen.has(key)) return;
      seen.add(key);
      ordered.push(point);
    };
    for (const segment of getVisibleTrailSegments(dot)) {
      push(segment.start);
      for (const point of getCellsAlongPath(segment.start, segment.end)) {
        push(point);
      }
    }
    push(dot.currentPos);
    return ordered;
  };

  const trailCellsFor = (dot: Dot) => {
    const playerBody = trailColor(dot.player);
    const playerHead = headColor(dot.player);
    const character = getCharacterForDot(dot.id, characterLoadout);
    const accent = character.trailAccentColor;
    const points = orderedTrailPoints(dot);

    if (!accent || character.shape === 'circle') {
      return points.map((point, index) => ({
        point,
        fill: index === points.length - 1 ? playerHead : playerBody,
      }));
    }

    return points.map((point, index) => {
      const isHead = index === points.length - 1;
      if (isHead) return { point, fill: accent };
      const fill = index % 2 === 0 ? playerBody : accent;
      return { point, fill };
    });
  };

  const trailColor = (player: 1 | 2) => (player === 1 ? '#3B8BFF' : '#FF4D6A');
  const headColor = (player: 1 | 2) => (player === 1 ? '#C5DCFF' : '#FFC1CC');

  const moveKillsOpponent = (movingDot: Dot, path: { r: number; c: number }[]) => {
    if (path.length === 0) return false;
    const end = path[path.length - 1];
    const landsOnEnemy = dots.some(
      (other) =>
        other.isAlive &&
        other.player !== movingDot.player &&
        pointsEqual(other.currentPos, end) &&
        canEliminateDot(other, boardFeatures)
    );
    if (landsOnEnemy) return true;
    return dots.some(
      (other) =>
        other.isAlive &&
        other.player !== movingDot.player &&
        doesTrailCutKillDot(other, movingDot.currentPos, end, boardFeatures)
    );
  };

  const renderMoveGuides = () => {
    if (!selectedDotId || selectedToken === null) return null;
    const movingDot = dots.find((d) => d.id === selectedDotId);
    if (!movingDot) return null;

    const startPos = movingDot.currentPos;

    return (
      <G>
        {HEX_DIRECTIONS.map((dir) => {
          if (dir === selectedDirection) return null;
          const path = walkHex(startPos, dir, selectedToken);
          const endPos = path[path.length - 1];
          if (!endPos || !path.every(isWithinBounds)) return null;
          if (!canLandAt(endPos, selectedDotId, dots, boardFeatures)) return null;
          if (pathCrossesOwnTrail(selectedDotId, path, dots)) return null;
          const kills = moveKillsOpponent(movingDot, path);

          return (
            <HexChain
              key={`guide_${dir}`}
              cells={path.map((point) => ({ point }))}
              color={trailColor(movingDot.player)}
              hexSize={cellSize}
              offsetX={offsetX}
              offsetY={offsetY}
              variant={kills ? 'threat' : 'hint'}
            />
          );
        })}
      </G>
    );
  };

  const renderPreview = () => {
    if (!selectedDotId || selectedToken === null || !selectedDirection) return null;
    const movingDot = dots.find((d) => d.id === selectedDotId);
    if (!movingDot) return null;

    const startPos = movingDot.currentPos;
    const path = walkHex(startPos, selectedDirection, selectedToken);
    const endPos = getDestination(startPos, selectedDirection, selectedToken);
    const inBounds = path.every(isWithinBounds);
    const touchesOwn = pathCrossesOwnTrail(selectedDotId, path, dots);
    const canLand = inBounds && !touchesOwn && canLandAt(endPos, selectedDotId, dots, boardFeatures);
    const kills = canLand && moveKillsOpponent(movingDot, path);

    return (
      <HexChain
        cells={path.map((point) => ({ point }))}
        color={canLand ? trailColor(movingDot.player) : '#EF4444'}
        hexSize={cellSize}
        offsetX={offsetX}
        offsetY={offsetY}
        variant={kills ? 'threat' : 'hint'}
      />
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
      onTouchCancel={onTouchEndLocal}
      // @ts-ignore - Support standard mouse dragging on web platform
      onMouseDown={onMouseDownLocal}
      onMouseMove={onMouseMoveLocal}
      onMouseUp={onMouseUpLocal}
    >
      <Svg width={boardWidth} height={boardHeight}>
        <Rect width={boardWidth} height={boardHeight} fill="#F4F7FB" />

        {hexCells}

        {/* Treasure, locks, and other board offerings stay in game state and are not drawn for now. */}

        <TrapPointMarkers
          trapPoints={trapPoints}
          cellSize={cellSize}
          offsetX={offsetX}
          offsetY={offsetY}
        />

        {renderMoveGuides()}
        {renderPreview()}

        {dots.map((dot) => {
          if (!dot || !dot.isAlive) return null;
          const cells = trailCellsFor(dot);
          if (cells.length === 0) return null;
          return (
            <HexChain
              key={`trail_${dot.id}`}
              cells={cells}
              color={trailColor(dot.player)}
              hexSize={cellSize}
              offsetX={offsetX}
              offsetY={offsetY}
              variant="trail"
              ring={ringForShape(getShapeForDot(dot.id))}
            />
          );
        })}

        {/* Active Player Node Markers */}
        {dots.map((dot) => {
          if (!dot || dot.isAlive) return null;
          const color = getDotColor(dot.id);
          return (
            <BaseDotMarker
              key={dot.id}
              dot={dot}
              color={color}
              isSelected={false}
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
          const { x: cx, y: cy } = cellToPixel(dot.currentPos, cellSize, offsetX, offsetY);

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
    borderWidth: 5,
    borderColor: '#C5D0DC',
    borderRadius: 12,
    backgroundColor: '#F4F7FB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 0,
    // @ts-ignore
    touchAction: 'none',
  },
});
