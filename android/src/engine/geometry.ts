import { Point, Direction, LineSegment } from '../types/game';
import { GRID_CONFIG } from '../constants/board';

/** Six neighbors of a pointy-top hex cell. */
export const HEX_DIRECTIONS: Direction[] = ['E', 'NE', 'NW', 'W', 'SW', 'SE'];

/**
 * Clockwise edges of a pointy-top hex, starting with the edge to the right of the top vertex.
 * Edge i sits between hex vertex i and vertex i+1.
 */
export const HEX_EDGE_DIRECTIONS: Direction[] = ['NE', 'E', 'SE', 'SW', 'W', 'NW'];

export function pointsEqual(p1: Point, p2: Point): boolean {
  return p1.r === p2.r && p1.c === p2.c;
}

function isOddRow(r: number): boolean {
  return ((r % 2) + 2) % 2 === 1;
}

/** One step to an adjacent hex. Odd rows are shifted right. */
export function stepHex(origin: Point, direction: Direction): Point {
  const odd = isOddRow(origin.r);
  switch (direction) {
    case 'E':
      return { r: origin.r, c: origin.c + 1 };
    case 'W':
      return { r: origin.r, c: origin.c - 1 };
    case 'NE':
      return { r: origin.r - 1, c: origin.c + (odd ? 1 : 0) };
    case 'NW':
      return { r: origin.r - 1, c: origin.c - (odd ? 0 : 1) };
    case 'SE':
      return { r: origin.r + 1, c: origin.c + (odd ? 1 : 0) };
    case 'SW':
      return { r: origin.r + 1, c: origin.c - (odd ? 0 : 1) };
  }
}

/** Hexes visited by walking `steps` times in one direction (excludes the origin). */
export function walkHex(origin: Point, direction: Direction, steps: number): Point[] {
  const cells: Point[] = [];
  let current = origin;
  for (let i = 0; i < steps; i++) {
    current = stepHex(current, direction);
    cells.push(current);
  }
  return cells;
}

export function getDestination(origin: Point, direction: Direction, steps: number): Point {
  const path = walkHex(origin, direction, steps);
  return path.length > 0 ? path[path.length - 1] : origin;
}

/** Which of the six directions, if any, carries `start` onto `end` in a straight line. */
export function inferHexDirection(start: Point, end: Point): Direction | null {
  if (pointsEqual(start, end)) return null;
  const limit = GRID_CONFIG.ROWS + GRID_CONFIG.COLS + 2;
  for (const direction of HEX_DIRECTIONS) {
    let current = start;
    for (let i = 0; i < limit; i++) {
      current = stepHex(current, direction);
      if (pointsEqual(current, end)) return direction;
    }
  }
  return null;
}

/** Hexes along a straight move (excludes start, includes end). */
export function getCellsAlongPath(start: Point, end: Point): Point[] {
  const direction = inferHexDirection(start, end);
  if (!direction) {
    return pointsEqual(start, end) ? [] : [end];
  }

  const cells: Point[] = [];
  let current = start;
  const limit = GRID_CONFIG.ROWS + GRID_CONFIG.COLS + 2;
  for (let i = 0; i < limit && !pointsEqual(current, end); i++) {
    current = stepHex(current, direction);
    cells.push(current);
  }
  return cells;
}

/** Start hex plus every hex the segment fills. */
export function getSegmentCells(start: Point, end: Point): Point[] {
  return [start, ...getCellsAlongPath(start, end)];
}

function cellKey(point: Point): string {
  return `${point.r},${point.c}`;
}

function sharedCells(aStart: Point, aEnd: Point, bStart: Point, bEnd: Point): Point[] {
  const bKeys = new Set(getSegmentCells(bStart, bEnd).map(cellKey));
  return getSegmentCells(aStart, aEnd).filter((point) => bKeys.has(cellKey(point)));
}

/**
 * Keeps only segments that form a continuous path ending at `anchor`.
 * When a middle segment is cut (self-cross), older disconnected pieces are dropped.
 */
export function getConnectedTrailHistory(
  history: LineSegment[],
  anchor: Point
): LineSegment[] {
  if (history.length === 0) return history;

  const connected: LineSegment[] = [];
  let current = anchor;

  for (let i = history.length - 1; i >= 0; i--) {
    const seg = history[i];
    if (pointsEqual(seg.end, current)) {
      connected.unshift(seg);
      current = seg.start;
    }
  }

  return connected;
}

/**
 * Rotation (degrees) for shapes that point "up" (-Y) by default.
 * Uses the most recent move; falls back to facing the opponent.
 */
export function getMovementRotationDegrees(dot: { player: 1 | 2; history: { start: Point; end: Point }[] }): number {
  const lastSegment = dot.history.length > 0 ? dot.history[dot.history.length - 1] : null;
  if (lastSegment && !pointsEqual(lastSegment.start, lastSegment.end)) {
    const from = cellToPixel(lastSegment.start, 1, 0, 0);
    const to = cellToPixel(lastSegment.end, 1, 0, 0);
    return (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 90;
  }
  return dot.player === 1 ? 0 : 180;
}

export function isWithinBounds(point: Point): boolean {
  return (
    point.r >= 0 &&
    point.r < GRID_CONFIG.ROWS &&
    point.c >= 0 &&
    point.c < GRID_CONFIG.COLS
  );
}

export function isPointOnClosedSegment(P: Point, A: Point, B: Point): boolean {
  return getSegmentCells(A, B).some((cell) => pointsEqual(cell, P));
}

export function isPointOnOpenSegment(P: Point, A: Point, B: Point): boolean {
  return isPointOnClosedSegment(P, A, B) && !pointsEqual(P, A) && !pointsEqual(P, B);
}

/** True when two hex trails share a cell that is more than a single shared endpoint. */
export function doSegmentsOverlap(A: Point, B: Point, C: Point, D: Point): boolean {
  const shared = sharedCells(A, B, C, D);
  if (shared.length === 0) return false;
  if (shared.length > 1) return true;
  const point = shared[0];
  const endpointOfFirst = pointsEqual(point, A) || pointsEqual(point, B);
  const endpointOfSecond = pointsEqual(point, C) || pointsEqual(point, D);
  return !(endpointOfFirst && endpointOfSecond);
}

export function doSegmentsIntersect(A: Point, B: Point, C: Point, D: Point): boolean {
  return sharedCells(A, B, C, D).length > 0;
}

/**
 * A new hex trail crosses an existing one when they share a cell.
 * When `ignoreNewStartJoint` is set, sharing only the cell the move starts on
 * does not count, so a trail can continue from its own tip.
 */
export function areSegmentsIntersecting(
  newStart: Point,
  newEnd: Point,
  existStart: Point,
  existEnd: Point,
  ignoreNewStartJoint: boolean
): boolean {
  const shared = sharedCells(newStart, newEnd, existStart, existEnd);
  if (shared.length === 0) return false;
  if (ignoreNewStartJoint && shared.every((point) => pointsEqual(point, newStart))) {
    return false;
  }
  return true;
}

/** Center of a pointy-top hex. `hexSize` is the center-to-vertex radius. */
export function cellToPixel(
  point: Point,
  hexSize: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  const x = hexSize * Math.sqrt(3) * (point.c + (isOddRow(point.r) ? 0.5 : 0)) + offsetX;
  const y = hexSize * 1.5 * point.r + offsetY;
  return { x, y };
}

export function hexVertices(cx: number, cy: number, size: number): { x: number; y: number }[] {
  const verts: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = ((-90 + 60 * i) * Math.PI) / 180;
    verts.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle),
    });
  }
  return verts;
}

export function hexPolygonPath(cx: number, cy: number, size: number): string {
  return (
    hexVertices(cx, cy, size)
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ') + ' Z'
  );
}

/** Fit a pointy-top hex board into the available pixel box. */
export function hexBoardMetrics(maxWidth: number, maxHeight: number): {
  hexSize: number;
  boardWidth: number;
  boardHeight: number;
  offsetX: number;
  offsetY: number;
} {
  const pad = 12;
  const widthUnits = Math.sqrt(3) * (GRID_CONFIG.COLS + 0.5);
  const heightUnits = 1.5 * (GRID_CONFIG.ROWS - 1) + 2;
  const hexSize = Math.max(
    3,
    Math.min((maxWidth - pad * 2) / widthUnits, (maxHeight - pad * 2) / heightUnits)
  );
  return {
    hexSize,
    boardWidth: widthUnits * hexSize + pad * 2,
    boardHeight: heightUnits * hexSize + pad * 2,
    offsetX: pad + (Math.sqrt(3) * hexSize) / 2,
    offsetY: pad + hexSize,
  };
}
