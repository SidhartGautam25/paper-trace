import { Dot, LineSegment, Point } from '../types/game';
import { getCharacter } from '../constants/characters';
import { getCellsAlongPath, getSegmentCells, pointsEqual, areSegmentsIntersecting, getConnectedTrailHistory, stepHex, HEX_DIRECTIONS } from './geometry';
import { BoardFeatureInstance } from '../types/boardFeatures';
import { isPointOnRegion } from '../types/gridRegion';

function isDotProtectedAtPosition(pos: Point, features: BoardFeatureInstance[]): boolean {
  return features.some((f) => f.typeId === 'shield_zone' && isPointOnRegion(pos, f.origin));
}

export function getMaxTrailLength(dot: Dot): number {
  return getCharacter(dot.characterId).maxTrailLength;
}

export { getConnectedTrailHistory } from './geometry';

export function getVisibleTrailSegments(dot: Dot): LineSegment[] {
  const connected = getConnectedTrailHistory(dot.history, dot.currentPos);
  const { visibleTrailLength } = getCharacter(dot.characterId);
  if (connected.length <= visibleTrailLength) return connected;
  return connected.slice(connected.length - visibleTrailLength);
}

/** Oldest stored segment used as a hidden trap (Reaper / hexagon). */
export function getGhostTrapSegment(dot: Dot): LineSegment | null {
  const char = getCharacter(dot.characterId);
  if (char.power !== 'ghost_trap') return null;
  if (dot.history.length < char.maxTrailLength) return null;
  return dot.history[0];
}

export function getTrapPointsForDot(dot: Dot): Point[] {
  const ghost = getGhostTrapSegment(dot);
  if (!ghost || !dot.isAlive) return [];

  const along = getCellsAlongPath(ghost.start, ghost.end);
  const points: Point[] = [ghost.start, ...along];
  const seen = new Set<string>();
  return points.filter((p) => {
    const key = `${p.r},${p.c}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getAllTrapPoints(dots: Dot[]): Point[] {
  const seen = new Set<string>();
  const traps: Point[] = [];
  for (const dot of dots) {
    for (const p of getTrapPointsForDot(dot)) {
      const key = `${p.r},${p.c}`;
      if (seen.has(key)) continue;
      seen.add(key);
      traps.push(p);
    }
  }
  return traps;
}

export function isBulwarkDot(dot: Dot): boolean {
  return false;
}

/** The trail segment currently attached to the dot's position. */
export function isSegmentAttachedToDot(dot: Dot, segment: LineSegment): boolean {
  return pointsEqual(segment.end, dot.currentPos);
}

/** Bulwark: only active trail can be cut; no segments are immune. */
export function isSegmentProtectedFromCuts(dot: Dot, segmentIndex: number): boolean {
  return false;
}

export function doesTrailCutKillDot(
  dot: Dot,
  newStart: Point,
  newEnd: Point,
  boardFeatures: BoardFeatureInstance[]
): boolean {
  if (!dot.isAlive) return false;
  if (isDotProtectedAtPosition(dot.currentPos, boardFeatures)) return false;

  return getVisibleTrailSegments(dot).some((segment) => {
    return areSegmentsIntersecting(newStart, newEnd, segment.start, segment.end, false);
  });
}

function cellKey(point: Point): string {
  return `${point.r},${point.c}`;
}

/**
 * Checks whether a proposed move violates trail or teammate proximity rules.
 *
 * Rules:
 * 1. Teammates: Must NOT touch (occupy or be adjacent to) even ONE box of any
 *    other teammate dot or any teammate's line.
 * 2. Own line:
 *    - Cannot land on or step through any box of its own line (cannot cross own trail).
 *    - Cannot intersect its own trail segments.
 *    - Can touch (be adjacent to) at most ONE box of its own line. This allows
 *      the dot to move in 5 directions (the 3 forward directions + the 2 flanking
 *      directions that touch the 1 line box behind the head), while blocking moving
 *      directly backward onto its own line.
 */
export function pathCrossesOwnTrail(movingDotId: string, pathCells: Point[], dots: Dot[]): boolean {
  const moving = dots.find((dot) => dot.id === movingDotId);
  if (!moving || pathCells.length === 0) return false;

  const startPos = moving.currentPos;
  const startKey = cellKey(startPos);
  const endPos = pathCells[pathCells.length - 1];

  // 1. Gather all teammate boxes (other dots on the same team and their visible trails)
  const teammateBoxes = new Set<string>();
  for (const dot of dots) {
    if (!dot.isAlive || dot.player !== moving.player || dot.id === moving.id) continue;
    teammateBoxes.add(cellKey(dot.currentPos));
    for (const segment of getVisibleTrailSegments(dot)) {
      for (const cell of getSegmentCells(segment.start, segment.end)) {
        teammateBoxes.add(cellKey(cell));
      }
    }
  }

  // 2. Rule: Must not touch even ONE box of teammate's line or dot
  for (const cell of pathCells) {
    const key = cellKey(cell);
    if (teammateBoxes.has(key)) return true;
    for (const direction of HEX_DIRECTIONS) {
      const neighbor = stepHex(cell, direction);
      if (teammateBoxes.has(cellKey(neighbor))) {
        return true;
      }
    }
  }

  // 3. Gather mover's own visible trail boxes (excluding the current starting position)
  const ownTrailBoxes = new Set<string>();
  const ownSegments = getVisibleTrailSegments(moving);
  for (const segment of ownSegments) {
    for (const cell of getSegmentCells(segment.start, segment.end)) {
      const key = cellKey(cell);
      if (key !== startKey) {
        ownTrailBoxes.add(key);
      }
    }
  }

  // 4. Rule for own line:
  // a) Cannot land on or step through any box of its own line
  for (const cell of pathCells) {
    const key = cellKey(cell);
    if (ownTrailBoxes.has(key)) {
      return true;
    }
  }

  // b) Cannot cross / intersect own trail segments
  for (const segment of ownSegments) {
    if (areSegmentsIntersecting(startPos, endPos, segment.start, segment.end, true)) {
      return true;
    }
  }

  // c) Across all cells of the move, can touch (be adjacent to) at most ONE box of its own line
  const touchedOwnBoxes = new Set<string>();
  for (const cell of pathCells) {
    for (const direction of HEX_DIRECTIONS) {
      const neighbor = stepHex(cell, direction);
      const neighborKey = cellKey(neighbor);
      if (neighborKey !== startKey && ownTrailBoxes.has(neighborKey)) {
        touchedOwnBoxes.add(neighborKey);
      }
    }
  }

  if (touchedOwnBoxes.size > 1) {
    return true; // Touches more than one box of its own line
  }

  return false;
}

export function isTrapPointForOpponent(pos: Point, dots: Dot[], movingPlayer: 1 | 2): boolean {
  return false;
}
