import { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const COLORS = ["#3b7af7", "#8853e0", "#f59e0b", "#22c55e", "#ef4444", "#06b6d4", "#ec4899"];
const COUNT = 90;

interface ParticleSpec {
  startX: number;
  targetY: number;
  drift: number;
  width: number;
  height: number;
  color: string;
  rotateStart: number;
  rotateEnd: number;
  delay: number;
  duration: number;
}

function Particle({ spec }: { spec: ParticleSpec }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      spec.delay,
      withTiming(1, { duration: spec.duration, easing: Easing.out(Easing.quad) }),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const fade = p < 0.85 ? 1 : Math.max(0, 1 - (p - 0.85) / 0.15);
    return {
      transform: [
        { translateX: spec.drift * p },
        { translateY: spec.targetY * p },
        { rotate: `${spec.rotateStart + (spec.rotateEnd - spec.rotateStart) * p}deg` },
      ],
      opacity: fade,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: spec.startX,
          top: -30,
          width: spec.width,
          height: spec.height,
          backgroundColor: spec.color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

export function Confetti() {
  const specs = useMemo<ParticleSpec[]>(() => {
    const { width, height } = Dimensions.get("window");
    return Array.from({ length: COUNT }).map((_, i) => {
      const w = 6 + Math.random() * 6;
      return {
        startX: Math.random() * width,
        targetY: height + 80,
        drift: (Math.random() - 0.5) * 160,
        width: w,
        height: w * (1.2 + Math.random() * 0.8),
        color: COLORS[i % COLORS.length],
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 720 - 360,
        delay: Math.random() * 250,
        duration: 1800 + Math.random() * 1400,
      };
    });
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {specs.map((s, i) => (
        <Particle key={i} spec={s} />
      ))}
    </View>
  );
}
