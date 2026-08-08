import React, { useEffect } from 'react';
import { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Platform } from 'react-native';
import { Dot } from '../../types/game';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BaseDotMarkerProps {
  dot: Dot;
  color: string;
  isSelected: boolean;
  cellSize: number;
  offsetX: number;
  offsetY: number;
  killEffect: 'collapse' | 'explode' | 'dissolve';
}

export const BaseDotMarker: React.FC<BaseDotMarkerProps> = ({
  dot,
  color,
  isSelected,
  cellSize,
  offsetX,
  offsetY,
  killEffect,
}) => {
  if (!dot || !dot.currentPos) return null;

  const cx = dot.currentPos.c * cellSize + offsetX;
  const cy = dot.currentPos.r * cellSize + offsetY;

  const pulse = useSharedValue(1.0);
  const aliveVal = useSharedValue(dot.isAlive ? 1.0 : 0.0);

  // Pulse animation on selection
  useEffect(() => {
    if (isSelected && dot.isAlive) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 600 }),
          withTiming(1.0, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1.0, { duration: 250 });
    }
  }, [isSelected, dot.isAlive]);

  // Transition aliveVal from 1.0 to 0.0 on death
  useEffect(() => {
    if (!dot.isAlive) {
      aliveVal.value = withTiming(0.0, { duration: 800 });
    } else {
      aliveVal.value = 1.0;
    }
  }, [dot.isAlive]);

  // Core dot animation props
  const coreProps = useAnimatedProps(() => {
    return {
      r: 6.5 * pulse.value * aliveVal.value,
      opacity: aliveVal.value,
    };
  });

  // Effect 1: Blackhole Implosion props
  const collapseRingProps = useAnimatedProps(() => {
    return {
      r: 3 + (1 - aliveVal.value) * 5,
      opacity: 1 - aliveVal.value,
    };
  });

  // Effect 2: Supernova Burst props
  const explodeRingProps = useAnimatedProps(() => {
    const rVal = 6.5 + (1 - aliveVal.value) * 18;
    const opVal = aliveVal.value * (1 - aliveVal.value) * 2.5; // peaks at mid point
    return {
      r: rVal,
      opacity: Math.max(0, Math.min(opVal, 1.0)),
    };
  });

  const craterProps = useAnimatedProps(() => {
    return {
      opacity: 1 - aliveVal.value,
    };
  });

  // Effect 3: Digital Dissolve props
  const dissolveProps = useAnimatedProps(() => {
    return {
      opacity: 0.45 * (1 - aliveVal.value),
    };
  });

  return (
    <G>
      {/* Outer Selection Highlight Ring */}
      {isSelected && dot.isAlive && (
        <Circle
          cx={cx}
          cy={cy}
          r={15}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeOpacity={0.35}
        />
      )}

      {/* Render selected elimination visual trace */}
      {killEffect === 'collapse' && (
        <AnimatedCircle
          cx={cx}
          cy={cy}
          fill="#000000"
          stroke={color}
          strokeWidth={1.2}
          animatedProps={collapseRingProps}
        />
      )}

      {killEffect === 'explode' && (
        <G>
          {/* Nova Shockwave */}
          <AnimatedCircle
            cx={cx}
            cy={cy}
            fill="none"
            stroke={color}
            strokeWidth={2}
            animatedProps={explodeRingProps}
          />
          {/* Leftover Crater */}
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={4.5}
            fill="none"
            stroke="#475569"
            strokeWidth={1}
            strokeDasharray="2, 2"
            animatedProps={craterProps}
          />
        </G>
      )}

      {killEffect === 'dissolve' && (
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={7.5}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          strokeDasharray="2, 3"
          animatedProps={dissolveProps}
        />
      )}

      {/* Core Dot (Animated Pulse & Fade) */}
      <AnimatedCircle
        cx={cx}
        cy={cy}
        fill={color}
        animatedProps={coreProps}
      />

      {/* Inner Highlight Dot */}
      {dot.isAlive && (
        <Circle
          cx={cx - 1.5}
          cy={cy - 1.5}
          r={1.8}
          fill="#FFFFFF"
          opacity={0.65}
        />
      )}

    </G>
  );
};
