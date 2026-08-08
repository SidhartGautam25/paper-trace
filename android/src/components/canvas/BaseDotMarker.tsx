import React, { useEffect } from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
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
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface BaseDotMarkerProps {
  dot: Dot;
  color: string;
  isSelected: boolean;
  cellSize: number;
  offsetX: number;
  offsetY: number;
  killEffect: 'collapse' | 'explode' | 'dissolve' | 'monster' | 'hammer';
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
      r: 7.8 * pulse.value * aliveVal.value,
      opacity: aliveVal.value,
    };
  });

  // Effect 1: Blackhole Implosion props
  const collapseRingProps = useAnimatedProps(() => {
    return {
      r: 3.5 + (1 - aliveVal.value) * 6,
      opacity: 1 - aliveVal.value,
    };
  });

  // Effect 2: Supernova Burst props
  const explodeRingProps = useAnimatedProps(() => {
    const rVal = 7.8 + (1 - aliveVal.value) * 22;
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

  // Effect 4: Monster Chomper props
  const topJawProps = useAnimatedProps(() => {
    const ty = -14 * aliveVal.value; // opens up to -14px
    const opacity = 1 - aliveVal.value;
    return {
      transform: `translate(${cx}, ${cy + ty})`,
      opacity,
    };
  });

  const bottomJawProps = useAnimatedProps(() => {
    const ty = 14 * aliveVal.value; // opens down to 14px
    const opacity = 1 - aliveVal.value;
    return {
      transform: `translate(${cx}, ${cy + ty})`,
      opacity,
    };
  });

  // Effect 5: Hammer Smash props
  const hammerProps = useAnimatedProps(() => {
    const rotation = -75 * aliveVal.value; // swings from -75deg to 0deg
    const opacity = 1 - aliveVal.value;
    return {
      transform: `translate(${cx}, ${cy}) rotate(${rotation})`,
      opacity,
    };
  });

  const shard1Props = useAnimatedProps(() => {
    const dist = (1 - aliveVal.value) * 16;
    const opacity = Math.max(0, Math.min(aliveVal.value * (1 - aliveVal.value) * 3, 1.0));
    return {
      cx: cx - dist,
      cy: cy - dist,
      opacity,
    };
  });

  const shard2Props = useAnimatedProps(() => {
    const dist = (1 - aliveVal.value) * 16;
    const opacity = Math.max(0, Math.min(aliveVal.value * (1 - aliveVal.value) * 3, 1.0));
    return {
      cx: cx + dist,
      cy: cy - dist,
      opacity,
    };
  });

  const shard3Props = useAnimatedProps(() => {
    const dist = (1 - aliveVal.value) * 16;
    const opacity = Math.max(0, Math.min(aliveVal.value * (1 - aliveVal.value) * 3, 1.0));
    return {
      cx: cx - dist,
      cy: cy + dist,
      opacity,
    };
  });

  const shard4Props = useAnimatedProps(() => {
    const dist = (1 - aliveVal.value) * 16;
    const opacity = Math.max(0, Math.min(aliveVal.value * (1 - aliveVal.value) * 3, 1.0));
    return {
      cx: cx + dist,
      cy: cy + dist,
      opacity,
    };
  });

  return (
    <G>
      {/* Outer Selection Highlight Ring */}
      {isSelected && dot.isAlive && (
        <Circle
          cx={cx}
          cy={cy}
          r={18}
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
            r={5.5}
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
          r={9.0}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          strokeDasharray="2, 3"
          animatedProps={dissolveProps}
        />
      )}

      {killEffect === 'monster' && (
        <G>
          {/* Monster Chomper Top Jaw */}
          <AnimatedPath
            d="M -12,-3 Q 0,-15 12,-3 L 12,0 L 8,-4 L 4,0 L 0,-4 L -4,0 L -8,-4 L -12,0 Z"
            fill="#EF4444"
            stroke="#DC2626"
            strokeWidth={1}
            animatedProps={topJawProps}
          />
          {/* Monster Eyes */}
          <AnimatedCircle
            cx={-4}
            cy={-6}
            r={1.8}
            fill="#FDE047"
            animatedProps={topJawProps}
          />
          <AnimatedCircle
            cx={4}
            cy={-6}
            r={1.8}
            fill="#FDE047"
            animatedProps={topJawProps}
          />
          {/* Monster Chomper Bottom Jaw */}
          <AnimatedPath
            d="M -12,3 Q 0,15 12,3 L 12,0 L 8,4 L 4,0 L 0,4 L -4,0 L -8,4 L -12,0 Z"
            fill="#EF4444"
            stroke="#DC2626"
            strokeWidth={1}
            animatedProps={bottomJawProps}
          />
        </G>
      )}

      {killEffect === 'hammer' && (
        <G>
          {/* Smash Hammer */}
          <AnimatedG animatedProps={hammerProps}>
            <Rect
              x={-2}
              y={-28}
              width={4}
              height={20}
              rx={1.5}
              fill="#D97706"
            />
            <Rect
              x={-10}
              y={-36}
              width={20}
              height={9}
              rx={2}
              fill="#64748B"
              stroke="#94A3B8"
              strokeWidth={1}
            />
          </AnimatedG>

          {/* Flying Fragments */}
          <AnimatedCircle r={2.5} fill="#E2E8F0" animatedProps={shard1Props} />
          <AnimatedCircle r={2.5} fill="#E2E8F0" animatedProps={shard2Props} />
          <AnimatedCircle r={2.5} fill="#E2E8F0" animatedProps={shard3Props} />
          <AnimatedCircle r={2.5} fill="#E2E8F0" animatedProps={shard4Props} />
        </G>
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
