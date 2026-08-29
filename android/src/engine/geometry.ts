import { Point, Direction } from '../types/game';
import { GRID_CONFIG } from '../constants/board';

/**
 * Checks if two points are at the exact same coordinate.
 */
export function pointsEqual(p1: Point, p2: Point): boolean {
  return p1.r === p2.r && p1.c === p2.c;
}

/**
 * Calculates the destination point based on an origin coordinate, a direction, and a number of steps.
 */
export function getDestination(origin: Point, direction: Direction, steps: number): Point {
  let dr = 0;
  let dc = 0;

  switch (direction) {
    case 'N':
      dr = -1;
      dc = 0;
      break;
    case 'NE':
      dr = -1;
      dc = 1;
      break;
    case 'E':
      dr = 0;
      dc = 1;
      break;
    case 'SE':
      dr = 1;
      dc = 1;
      break;
    case 'S':
      dr = 1;
      dc = 0;
      break;
    case 'SW':
      dr = 1;
      dc = -1;
      break;
    case 'W':
      dr = 0;
      dc = -1;
      break;
    case 'NW':
      dr = -1;
      dc = -1;
      break;
  }

  return {
    r: origin.r + dr * steps,
    c: origin.c + dc * steps,
  };
}

/** Grid points visited along a straight 8-way move (excludes start, includes end). */
export function getCellsAlongPath(start: Point, end: Point): Point[] {
  const cells: Point[] = [];
  const dr = Math.sign(end.r - start.r);
  const dc = Math.sign(end.c - start.c);
  let r = start.r;
  let c = start.c;

  while (r !== end.r || c !== end.c) {
    r += dr;
    c += dc;
    cells.push({ r, c });
  }

  return cells;
}

/**
 * Rotation (degrees) for dot shapes that point "up" (-Y) by default.
 * Uses the most recent move segment; falls back to facing the opponent.
 */
export function getMovementRotationDegrees(dot: { player: 1 | 2; history: { start: Point; end: Point }[] }): number {
  const lastSegment = dot.history.length > 0 ? dot.history[dot.history.length - 1] : null;
  if (lastSegment) {
    const dr = lastSegment.end.r - lastSegment.start.r;
    const dc = lastSegment.end.c - lastSegment.start.c;
    if (dr !== 0 || dc !== 0) {
      return (Math.atan2(dr, dc) * 180) / Math.PI + 90;
    }
  }
  return dot.player === 1 ? 0 : 180;
}

/**
 * Validates whether a point is within the board's grid boundaries.
 */
export function isWithinBounds(point: Point): boolean {
  return (
    point.r >= 0 &&
    point.r < GRID_CONFIG.ROWS &&
    point.c >= 0 &&
    point.c < GRID_CONFIG.COLS
  );
}

/**
 * Helper to check if a point lies on the closed segment AB.
 */
export function isPointOnClosedSegment(P: Point, A: Point, B: Point): boolean {
  // Check collinearity using cross product
  const cross = (P.r - A.r) * (B.c - A.c) - (P.c - A.c) * (B.r - A.r);
  if (Math.abs(cross) > 1e-9) return false;

  // Check bounding box projection
  return (
    P.c <= Math.max(A.c, B.c) &&
    P.c >= Math.min(A.c, B.c) &&
    P.r <= Math.max(A.r, B.r) &&
    P.r >= Math.min(A.r, B.r)
  );
}

/**
 * Helper to check if a point lies on the open segment AB (excluding endpoints A and B).
 */
export function isPointOnOpenSegment(P: Point, A: Point, B: Point): boolean {
  return isPointOnClosedSegment(P, A, B) && !pointsEqual(P, A) && !pointsEqual(P, B);
}

/**
 * Detects whether two segments A-B and C-D overlap in positive length.
 */
export function doSegmentsOverlap(A: Point, B: Point, C: Point, D: Point): boolean {
  return (
    isPointOnOpenSegment(C, A, B) ||
    isPointOnOpenSegment(D, A, B) ||
    isPointOnOpenSegment(A, C, D) ||
    isPointOnOpenSegment(B, C, D) ||
    (pointsEqual(A, C) && pointsEqual(B, D)) ||
    (pointsEqual(A, D) && pointsEqual(B, C))
  );
}

/**
 * Checks if line segment A-B intersects line segment C-D using CCW orientation tests.
 * This includes intersections where segments cross, touch, or overlap.
 */
export function doSegmentsIntersect(A: Point, B: Point, C: Point, D: Point): boolean {
  const ccwValue = (p: Point, q: Point, r: Point) => {
    return (r.r - p.r) * (q.c - p.c) - (r.c - p.c) * (q.r - p.r);
  };

  const val1 = ccwValue(A, B, C);
  const val2 = ccwValue(A, B, D);
  const val3 = ccwValue(C, D, A);
  const val4 = ccwValue(C, D, B);

  // Strict crossing case
  if (
    ((val1 > 0 && val2 < 0) || (val1 < 0 && val2 > 0)) &&
    ((val3 > 0 && val4 < 0) || (val3 < 0 && val4 > 0))
  ) {
    return true;
  }

  // Touch / Collinear overlap cases
  if (isPointOnClosedSegment(C, A, B)) return true;
  if (isPointOnClosedSegment(D, A, B)) return true;
  if (isPointOnClosedSegment(A, C, D)) return true;
  if (isPointOnClosedSegment(B, C, D)) return true;

  return false;
}

/**
 * Determines if a new move segment (newStart -> newEnd) intersects an existing segment (existStart -> existEnd).
 * If ignoreNewStartJoint is true, it ignores intersections that occur *only* at newStart
 * (allowing continuous movement from a joint without pruning the previous line connected to that same joint).
 */
export function areSegmentsIntersecting(
  newStart: Point,
  newEnd: Point,
  existStart: Point,
  existEnd: Point,
  ignoreNewStartJoint: boolean
): boolean {
  if (!doSegmentsIntersect(newStart, newEnd, existStart, existEnd)) {
    return false;
  }

  if (ignoreNewStartJoint) {
    const sharesNewStart = pointsEqual(newStart, existStart) || pointsEqual(newStart, existEnd);
    if (sharesNewStart) {
      // If they only touch at newStart and do not overlap in positive length, it is not an intersection.
      if (!doSegmentsOverlap(newStart, newEnd, existStart, existEnd)) {
        return false;
      }
    }
  }

  return true;
}
