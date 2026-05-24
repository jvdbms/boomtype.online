import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface XpRewardLineProps {
  xp: number;
  className?: string;
  duration?: number;
}

export default function XpRewardLine({
  xp,
  className = "text-yellow-400 font-bold mb-1 text-sm",
  duration = 0.6,
}: XpRewardLineProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    const controls = animate(count, xp, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => {
      controls.stop();
      unsub();
    };
  }, [xp, duration, count, rounded]);

  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${className} flex items-center justify-center gap-1 tabular-nums`}
    >
      ⚡ +{display} XP earned
    </motion.p>
  );
}
