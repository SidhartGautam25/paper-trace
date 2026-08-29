import { RegionOrigin } from '../types/gridRegion';

export function regionPolygonPath(
  origin: RegionOrigin,
  cellSize: number,
  offsetX: number,
  offsetY: number,
  insetRatio = 0.14
): string {
  const pad = cellSize * insetRatio;
  const x0 = origin.c * cellSize + offsetX + pad;
  const y0 = origin.r * cellSize + offsetY + pad;
  const x1 = (origin.c + 1) * cellSize + offsetX - pad;
  const y1 = (origin.r + 1) * cellSize + offsetY - pad;
  return `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;
}

export function regionLabelPosition(
  origin: RegionOrigin,
  cellSize: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  return {
    x: (origin.c + 0.5) * cellSize + offsetX,
    y: (origin.r + 0.5) * cellSize + offsetY + 2,
  };
}

export interface RegionCornerPixels {
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  bl: { x: number; y: number };
  br: { x: number; y: number };
}

export function getRegionCornerPixels(
  origin: RegionOrigin,
  cellSize: number,
  offsetX: number,
  offsetY: number
): RegionCornerPixels {
  return {
    tl: { x: origin.c * cellSize + offsetX, y: origin.r * cellSize + offsetY },
    tr: { x: (origin.c + 1) * cellSize + offsetX, y: origin.r * cellSize + offsetY },
    bl: { x: origin.c * cellSize + offsetX, y: (origin.r + 1) * cellSize + offsetY },
    br: { x: (origin.c + 1) * cellSize + offsetX, y: (origin.r + 1) * cellSize + offsetY },
  };
}
