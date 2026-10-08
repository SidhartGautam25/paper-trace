import { Dot, LineSegment, Point } from '../types/game';
import { getCharacter } from '../constants/characters';
import { getCellsAlongPath, pointsEqual, areSegmentsIntersecting, getConnectedTrailHistory } from './geometry';
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

export function isTrapPointForOpponent(pos: Point, dots: Dot[], movingPlayer: 1 | 2): boolean {
  return dots.some(
    (d) =>
      d.isAlive &&
      d.player !== movingPlayer &&
      getCharacter(d.characterId).power === 'ghost_trap' &&
      getTrapPointsForDot(d).some((trap) => pointsEqual(trap, pos))
  );
}
