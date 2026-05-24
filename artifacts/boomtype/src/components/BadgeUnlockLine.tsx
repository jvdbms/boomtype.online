import { motion } from "framer-motion";

interface BadgeUnlockLineProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function BadgeUnlockLine({
  children,
  className = "text-purple-400 font-bold mb-1 text-sm",
  glowColor = "rgba(168, 85, 247, 0.7)",
}: BadgeUnlockLineProps) {
  return (
    <motion.p
      initial={{ opacity: 0, scale: 0.4, filter: "blur(4px)" }}
      animate={{
        opacity: 1,
        scale: [0.4, 1.25, 1],
        filter: "blur(0px)",
        textShadow: [
          `0 0 0px ${glowColor}`,
          `0 0 20px ${glowColor}`,
          `0 0 8px ${glowColor}`,
        ],
      }}
      transition={{
        duration: 0.7,
        delay: 0.25,
        times: [0, 0.6, 1],
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className={className}
    >
      {children}
    </motion.p>
  );
}
