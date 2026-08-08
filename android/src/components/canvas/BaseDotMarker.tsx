import React, { useEffect } from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
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
  themeColors: any;
}

export const BaseDotMarker: React.FC<BaseDotMarkerProps> = ({
  dot,
  color,
  isSelected,
  cellSize,
  offsetX,
  offsetY,
  killEffect,
  themeColors,
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
      aliveVal.value = withTiming(0.0, { duration: 2500 });
    } else {
      aliveVal.value = 1.0;
    }
  }, [dot.isAlive]);

  const killerColor = themeColors ? (dot.player === 1 ? themeColors.p2Shades[0] : themeColors.p1Shades[0]) : '#EF4444';

  // Core dot animation props
  const coreProps = useAnimatedProps(() => {
    const val = aliveVal.value;
    if (killEffect === 'monster' || killEffect === 'hammer') {
      let opacity = 0;
      let scale = 0;
      if (val >= 0.4) {
        opacity = (val - 0.4) / 0.6;
        scale = opacity;
      }
      return {
        r: 7.8 * pulse.value * scale,
        opacity: opacity,
      };
    }
    return {
      r: 7.8 * pulse.value * val,
      opacity: val,
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
    const val = aliveVal.value;
    const progress = Math.max(0, Math.min((val - 0.4) / 0.6, 1.0));
    const ty = -28 * progress; // opens up to -28px (massive!)
    let opacity = 0;
    if (val >= 0.4) {
      opacity = (1 - val) / 0.6;
    } else {
      opacity = val / 0.4;
    }
    return {
      transform: `translate(${cx}, ${cy + ty})`,
      opacity: Math.max(0, Math.min(opacity, 1.0)),
    };
  });

  const bottomJawProps = useAnimatedProps(() => {
    const val = aliveVal.value;
    const progress = Math.max(0, Math.min((val - 0.4) / 0.6, 1.0));
    const ty = 28 * progress; // opens down to 28px
    let opacity = 0;
    if (val >= 0.4) {
      opacity = (1 - val) / 0.6;
    } else {
      opacity = val / 0.4;
    }
    return {
      transform: `translate(${cx}, ${cy + ty})`,
      opacity: Math.max(0, Math.min(opacity, 1.0)),
    };
  });

  // Effect 5: Hammer Smash props
  const hammerProps = useAnimatedProps(() => {
    const val = aliveVal.value;
    const progress = Math.max(0, Math.min((val - 0.4) / 0.6, 1.0));
    const rotation = -70 * progress;
    const tx = cx + 60 * progress;
    const ty = cy - 70 * progress;
    
    let opacity = 0;
    if (val >= 0.4) {
      opacity = (1 - val) / 0.6;
    } else {
      opacity = val / 0.4;
    }
    return {
      transform: `translate(${tx}, ${ty}) rotate(${rotation})`,
      opacity: Math.max(0, Math.min(opacity, 1.0)),
    };
  });

  const shardProps = (angle: number, maxDist: number) => {
    return useAnimatedProps(() => {
      const val = aliveVal.value;
      if (val >= 0.4) {
        return {
          cx: cx,
          cy: cy,
          opacity: 0,
        };
      }
      const progress = (0.4 - val) / 0.4;
      const dist = progress * maxDist;
      const opacity = 1 - progress;
      const rad = (angle * Math.PI) / 180;
      return {
        cx: cx + Math.cos(rad) * dist,
        cy: cy + Math.sin(rad) * dist,
        opacity: opacity,
      };
    });
  };

  const shard1Props = shardProps(0, 32);
  const shard2Props = shardProps(60, 32);
  const shard3Props = shardProps(120, 32);
  const shard4Props = shardProps(180, 32);
  const shard5Props = shardProps(240, 32);
  const shard6Props = shardProps(300, 32);

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

      {/* Render selected elimination visual trace (Drawn ON TOP of core dot) */}
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
          <AnimatedG animatedProps={topJawProps}>
            <Path
              d="M -28,-4 Q 0,-30 28,-4 L 28,0 L 20,-8 L 12,0 L 0,-10 L -12,0 L -20,-8 L -28,0 Z"
              fill={killerColor}
              stroke="rgba(0, 0, 0, 0.4)"
              strokeWidth={1}
            />
            {/* Monster Eyes */}
            <Circle cx={-9} cy={-14} r={3.5} fill="#FDE047" />
            <Circle cx={9} cy={-14} r={3.5} fill="#FDE047" />
            <Circle cx={-9} cy={-14} r={1.2} fill="#000000" />
            <Circle cx={9} cy={-14} r={1.2} fill="#000000" />
          </AnimatedG>

          {/* Monster Chomper Bottom Jaw */}
          <AnimatedG animatedProps={bottomJawProps}>
            <Path
              d="M -28,4 Q 0,30 28,4 L 28,0 L 20,8 L 12,0 L 0,10 L -12,0 L -20,8 L -28,0 Z"
              fill={killerColor}
              stroke="rgba(0, 0, 0, 0.4)"
              strokeWidth={1}
            />
          </AnimatedG>
        </G>
      )}

      {killEffect === 'hammer' && (
        <G>
          {/* Smash Hammer */}
          <AnimatedG animatedProps={hammerProps}>
            <Rect
              x={-3.5}
              y={-87}
              width={7}
              height={75}
              rx={2}
              fill="#D97706"
            />
            <Rect
              x={-20}
              y={-99}
              width={40}
              height={24}
              rx={4}
              fill="#64748B"
              stroke={killerColor}
              strokeWidth={1.5}
            />
          </AnimatedG>

          {/* Flying Fragments in all 6 directions (crashing) */}
          <AnimatedCircle r={4.5} fill={color} animatedProps={shard1Props} />
          <AnimatedCircle r={4.5} fill={color} animatedProps={shard2Props} />
          <AnimatedCircle r={4.5} fill={color} animatedProps={shard3Props} />
          <AnimatedCircle r={4.5} fill={color} animatedProps={shard4Props} />
          <AnimatedCircle r={4.5} fill={color} animatedProps={shard5Props} />
          <AnimatedCircle r={4.5} fill={color} animatedProps={shard6Props} />
        </G>
      )}

    </G>
  );
};
