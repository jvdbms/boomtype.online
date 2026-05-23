import { Feather } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useSubmitScore } from "@workspace/api-client-react";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { Confetti } from "@/components/Confetti";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import {
  calculateXP,
  getLevel,
  getLevelColor,
  getXPLevel,
  XP_PER_LEVEL,
} from "@/constants/words";

export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    wpm: string;
    accuracy: string;
    mistakes: string;
    duration: string;
    correct: string;
    total: string;
  }>();

  const wpm = parseFloat(params.wpm ?? "0");
  const accuracy = parseFloat(params.accuracy ?? "0");
  const mistakes = parseInt(params.mistakes ?? "0", 10);
  const duration = parseInt(params.duration ?? "30", 10);
  const correctWords = parseInt(params.correct ?? "0", 10);

  const { nickname, totalXP, highScore, addXP, updateStreak, setHighScore } = useUser();
  const [newStreak, setNewStreak] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const ranOnce = useRef(false);
  const previousBest = useRef(highScore).current;

  const xpEarned = calculateXP(wpm, accuracy, duration);
  const level = getLevel(wpm);
  const levelColor = getLevelColor(wpm);

  // Snapshot XP before this run's XP was added, so we can animate from
  // the pre-test value to the new total.
  const xpBefore = useRef(totalXP).current;
  const xpAfter = xpBefore + xpEarned;
  const xpLevelBefore = getXPLevel(xpBefore);
  const xpLevelAfter = getXPLevel(xpAfter);
  const leveledUp = xpLevelAfter.level > xpLevelBefore.level;

  // Animated XP count + progress fill
  const animatedXP = useSharedValue(xpBefore);
  const animatedProgress = useSharedValue(xpLevelBefore.progress);
  const [displayXP, setDisplayXP] = useState(xpBefore);

  useEffect(() => {
    animatedXP.value = withDelay(
      350,
      withTiming(xpAfter, { duration: 1200, easing: Easing.out(Easing.cubic) }),
    );
    // If they leveled up, fill to 100% then snap to remainder.
    if (leveledUp) {
      animatedProgress.value = withDelay(
        350,
        withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }, (finished) => {
          if (finished) {
            animatedProgress.value = 0;
            animatedProgress.value = withTiming(xpLevelAfter.progress, {
              duration: 500,
              easing: Easing.out(Easing.cubic),
            });
          }
        }),
      );
    } else {
      animatedProgress.value = withDelay(
        350,
        withTiming(xpLevelAfter.progress, {
          duration: 1200,
          easing: Easing.out(Easing.cubic),
        }),
      );
    }
    const id = setInterval(() => {
      setDisplayXP(Math.round(animatedXP.value));
    }, 32);
    return () => clearInterval(id);
  }, []);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.max(4, animatedProgress.value * 100)}%`,
  }));

  const xpThisRun = Math.max(0, displayXP - xpBefore);

  const { mutate: submitScore, isPending } = useSubmitScore();

  const successPlayer = useAudioPlayer(require("@/assets/sounds/success.wav"));

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const isNewPersonalBest = wpm > 0 && wpm > previousBest;
  const isPerfectAccuracy = accuracy >= 98;
  const shouldCelebrate = isNewPersonalBest || leveledUp || isPerfectAccuracy;

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (shouldCelebrate) {
      setShowConfetti(true);
      try {
        successPlayer.seekTo(0);
        successPlayer.play();
      } catch {
        // Audio playback is best-effort; ignore failures (e.g. silent mode).
      }
    }

    (async () => {
      const streak = await updateStreak();
      setNewStreak(streak);
      await setHighScore(wpm);
      await addXP(xpEarned);

      if (nickname) {
        submitScore(
          { data: { nickname, wpm, accuracy, duration, mistakes } },
          {
            onSuccess: () => setSubmitted(true),
            onError: () => setSubmitError(true),
          }
        );
      }
    })();
  }, []);

  const handleRetry = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace({ pathname: "/test", params: { duration } });
  };

  const handleHome = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 20, paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top result hero */}
        <Animated.View
          entering={FadeInDown.duration(500).easing(Easing.out(Easing.cubic))}
          style={styles.heroSection}
        >
          <LinearGradient
            colors={[`${levelColor}30`, `${colors.background}00`]}
            style={styles.heroGradient}
          />
          <Animated.Text
            entering={FadeInUp.delay(100).duration(400)}
            style={[styles.heroLabel, { color: levelColor }]}
          >
            {level}
          </Animated.Text>
          <Animated.Text
            entering={ZoomIn.delay(200).duration(600).easing(Easing.out(Easing.back(1.4)))}
            style={[styles.wpmHero, { color: colors.foreground }]}
          >
            {Math.round(wpm)}
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(450).duration(400)}
            style={[styles.wpmUnit, { color: colors.mutedForeground }]}
          >
            words per minute
          </Animated.Text>
        </Animated.View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { icon: "check-circle", label: "Accuracy", value: `${Math.round(accuracy)}%`, color: colors.success },
            { icon: "x-circle", label: "Mistakes", value: mistakes, color: mistakes > 0 ? colors.destructive : colors.mutedForeground },
            { icon: "list", label: "Words typed", value: correctWords, color: colors.primary },
            { icon: "clock", label: "Duration", value: `${duration}s`, color: colors.accent },
          ].map((stat, i) => (
            <Animated.View
              key={stat.label}
              entering={FadeInDown.delay(600 + i * 90).duration(420).easing(Easing.out(Easing.cubic))}
              style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name={stat.icon as any} size={18} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* XP earned */}
        <Animated.View
          entering={FadeInDown.delay(1000).duration(450).easing(Easing.out(Easing.cubic))}
          style={[styles.xpCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.xpHeader}>
            <View style={[styles.xpIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="star" size={20} color={colors.primary} />
            </View>
            <View style={styles.xpText}>
              <Text style={[styles.xpAmount, { color: colors.primary }]}>+{xpThisRun} XP</Text>
              <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>earned this test</Text>
            </View>
            {newStreak !== null && newStreak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: "#f59e0b22", borderColor: "#f59e0b44" }]}>
                <Feather name="zap" size={14} color="#f59e0b" />
                <Text style={[styles.streakText, { color: "#f59e0b" }]}>{newStreak}d</Text>
              </View>
            )}
          </View>

          <View style={styles.levelMetaRow}>
            <Text style={[styles.levelMeta, { color: colors.foreground }]}>
              LVL {leveledUp ? xpLevelAfter.level : xpLevelBefore.level}
            </Text>
            <Text style={[styles.levelMetaMuted, { color: colors.mutedForeground }]}>
              {displayXP % XP_PER_LEVEL} / {XP_PER_LEVEL}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[styles.progressFill, { backgroundColor: colors.primary }, progressBarStyle]}
            />
          </View>
          {leveledUp && (
            <Animated.View
              entering={ZoomIn.delay(1400).duration(400).easing(Easing.out(Easing.back(1.6)))}
              style={styles.levelUpRow}
            >
              <Feather name="trending-up" size={14} color={colors.success} />
              <Text style={[styles.levelUpText, { color: colors.success }]}>
                Level up! You reached LVL {xpLevelAfter.level}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Submit status */}
        {nickname ? (
          <Animated.View
            entering={FadeInDown.delay(1150).duration(420)}
            style={[styles.submitStatus, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {isPending ? (
              <>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.submitText, { color: colors.mutedForeground }]}>
                  Submitting to leaderboard...
                </Text>
              </>
            ) : submitted ? (
              <>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={[styles.submitText, { color: colors.success }]}>
                  Score submitted to leaderboard
                </Text>
              </>
            ) : submitError ? (
              <>
                <Feather name="alert-circle" size={16} color={colors.destructive} />
                <Text style={[styles.submitText, { color: colors.destructive }]}>
                  Couldn't submit score
                </Text>
              </>
            ) : null}
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.delay(1150).duration(420)}
            style={[styles.submitStatus, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}
          >
            <Feather name="award" size={16} color={colors.accent} />
            <Text style={[styles.submitText, { color: colors.accent }]}>
              Set a nickname on the Home tab to join the leaderboard
            </Text>
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.delay(1300).duration(420)}
          style={styles.actions}
        >
          <Pressable
            style={({ pressed }) => [
              styles.retryBtn,
              { opacity: pressed ? 0.85 : 1, overflow: "hidden", borderRadius: 14 },
            ]}
            onPress={handleRetry}
            testID="retry-btn"
          >
            <LinearGradient
              colors={["#3b7af7", "#8853e0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.retryGradient}
            >
              <Feather name="refresh-cw" size={18} color="#fff" />
              <Text style={styles.retryText}>Try again</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.homeBtn,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleHome}
          >
            <Feather name="home" size={18} color={colors.foreground} />
            <Text style={[styles.homeBtnText, { color: colors.foreground }]}>Home</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
      {showConfetti && <Confetti />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  wpmHero: {
    fontSize: 80,
    fontWeight: "900",
    letterSpacing: -4,
    lineHeight: 84,
  },
  wpmUnit: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    width: "47%",
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  xpCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  xpHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  levelMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelMeta: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  levelMetaMuted: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  levelUpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  levelUpText: {
    fontSize: 12,
    fontWeight: "700",
  },
  xpIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  xpText: {
    flex: 1,
  },
  xpAmount: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  xpLabel: {
    fontSize: 12,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  streakText: {
    fontSize: 13,
    fontWeight: "700",
  },
  submitStatus: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  submitText: {
    fontSize: 13,
    flex: 1,
    fontWeight: "500",
  },
  actions: {
    paddingHorizontal: 16,
    gap: 10,
  },
  retryBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  retryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  homeBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
