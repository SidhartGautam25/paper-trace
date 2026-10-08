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
  return getCharacter(dot.characterId).power === 'armored_front';
}

/** The trail segment currently attached to the dot's position. */
export function isSegmentAttachedToDot(dot: Dot, segment: LineSegment): boolean {
  return pointsEqual(segment.end, dot.currentPos);
}

/** Bulwark: only the line connected to the dot is armored. */
export function isSegmentProtectedFromCuts(dot: Dot, segmentIndex: number): boolean {
  if (!dot.isAlive || !isBulwarkDot(dot)) return false;
  const segment = dot.history[segmentIndex];
  if (!segment) return false;
  return isSegmentAttachedToDot(dot, segment);
}

export function doesTrailCutKillDot(
  dot: Dot,
  newStart: Point,
  newEnd: Point,
  boardFeatures: BoardFeatureInstance[]
): boolean {
  if (!dot.isAlive) return false;
  if (isDotProtectedAtPosition(dot.currentPos, boardFeatures)) return false;

  return getConnectedTrailHistory(dot.history, dot.currentPos).some((segment) => {
    const segmentIndex = dot.history.findIndex((s) => s.id === segment.id);
    if (segmentIndex >= 0 && isSegmentProtectedFromCuts(dot, segmentIndex)) return false;
    return areSegmentsIntersecting(newStart, newEnd, segment.start, segment.end, false);
  });
}

function cellKey(point: Point): string {
  return `${point.r},${point.c}`;
}

/**
 * True when this move lands on or shares a side with a friendly trail.
 * Stepping off the mover's own hex is allowed. Brushing the rest of that
 * line, or any teammate's line, is not.
 */
export function pathCrossesOwnTrail(movingDotId: string, pathCells: Point[], dots: Dot[]): boolean {
  const moving = dots.find((dot) => dot.id === movingDotId);
  if (!moving || pathCells.length === 0) return false;

  const forbidden = new Set<string>();
  for (const dot of dots) {
    if (!dot.isAlive || dot.player !== moving.player) continue;
    forbidden.add(cellKey(dot.currentPos));
    for (const segment of dot.history) {
      for (const cell of getSegmentCells(segment.start, segment.end)) {
        forbidden.add(cellKey(cell));
      }
    }
  }
  const startKey = cellKey(moving.currentPos);
  forbidden.delete(startKey);

  return pathCells.some((cell) => {
    const key = cellKey(cell);
    if (forbidden.has(key)) return true;
    return HEX_DIRECTIONS.some((direction) => {
      const neighbor = stepHex(cell, direction);
      const neighborKey = cellKey(neighbor);
      if (neighborKey === startKey) return false;
      return forbidden.has(neighborKey);
    });
  });
}

export function isTrapPointForOpponent(pos: Point, dots: Dot[], movingPlayer: 1 | 2): boolean {
  return dots.some(
    (d) =>
      d.isAlive &&
      d.player !== movingPlayer &&
      getCharacter(d.characterId).power === 'ghost_trap' &&
      getTrapPointsForDot(d).some((trap) => pointsEqual(trap, pos))
  );
}
