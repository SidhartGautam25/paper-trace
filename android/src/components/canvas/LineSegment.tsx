import React from 'react';
import { Line, G } from 'react-native-svg';
import { LineSegment as LineSegmentType } from '../../types/game';

interface LineSegmentProps {
  segment: LineSegmentType;
  color: string;
  index: number; // Index in the history array (0 to length-1)
  historyLength: number;
  cellSize: number;
  offsetX: number;
  offsetY: number;
}

export const LineSegment: React.FC<LineSegmentProps> = ({
  segment,
  color,
  index,
  historyLength,
  cellSize,
  offsetX,
  offsetY,
}) => {
  const x1 = segment.start.c * cellSize + offsetX;
  const y1 = segment.start.r * cellSize + offsetY;
  const x2 = segment.end.c * cellSize + offsetX;
  const y2 = segment.end.r * cellSize + offsetY;

  // Extract dot number from segment ID (e.g. "p1_2_line_..." => "2")
  const dotId = segment.id.split('_line_')[0];
  const dotNumber = dotId.split('_')[1] || '1';

  // Calculate age properties. Newest segment is at index (historyLength - 1)
  const ageFromNewest = historyLength - 1 - index;

  let baseOpacity = 1.0;
  if (ageFromNewest === 2) {
    baseOpacity = 0.3; // Oldest segment
  } else if (ageFromNewest === 1) {
    baseOpacity = 0.65; // Middle segment
  }

  // Styles based on Dot Number
  if (dotNumber === '1') {
    // Dot 1: Simple plain solid line
    return (
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={3}
        strokeOpacity={baseOpacity}
        strokeLinecap="round"
      />
    );
  } else if (dotNumber === '2') {
    // Dot 2: Dotted line movement
    return (
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={3.5}
        strokeOpacity={baseOpacity}
        strokeLinecap="round"
        strokeDasharray="1, 5" // Circular dots spacing
      />
    );
  } else {
    // Dot 3: Glowing neon-style dual line (other effect)
    return (
      <G>
        {/* Outer wider glow line with low opacity */}
        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={9}
          strokeOpacity={baseOpacity * 0.25}
          strokeLinecap="round"
        />
        {/* Inner bright core line */}
        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={2.5}
          strokeOpacity={baseOpacity}
          strokeLinecap="round"
        />
      </G>
    );
  }
};
