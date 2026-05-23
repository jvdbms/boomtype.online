import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTypingTest } from "@/hooks/useTypingTest";

const WORDS_PER_ROW = 5;
const VISIBLE_ROWS = 3;

export default function TestScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ duration: string }>();
  const duration = parseInt(params.duration ?? "30", 10);

  const test = useTypingTest(duration);
  const inputRef = useRef<TextInput>(null);
  const shakeVal = useSharedValue(0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (test.phase === "running") {
      inputRef.current?.focus();
    }
  }, [test.phase]);

  useEffect(() => {
    if (test.phase === "finished") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Keyboard.dismiss();
      router.replace({
        pathname: "/results",
        params: {
          wpm: test.wpm,
          accuracy: test.accuracy,
          mistakes: test.mistakes,
          duration,
          correct: test.completedWords.filter((w) => w.correct).length,
          total: test.completedWords.length,
        },
      });
    }
  }, [test.phase]);

  const handleInput = (text: string) => {
    const lastChar = text.slice(-1);
    if (lastChar === " " && text.trim().length > 0) {
      const typed = text.trim();
      const expected = test.words[test.currentWordIndex];
      if (typed !== expected) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        shakeVal.value = withSequence(
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(-4, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
    }
    test.handleInput(text);
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeVal.value }],
  }));

  const startWordIndex = Math.max(0, Math.floor(test.currentWordIndex / WORDS_PER_ROW) * WORDS_PER_ROW - WORDS_PER_ROW);
  const visibleWords = test.words.slice(startWordIndex, startWordIndex + WORDS_PER_ROW * VISIBLE_ROWS);

  const timerPercent = test.timeLeft / duration;
  const timerColor = timerPercent > 0.5 ? colors.primary : timerPercent > 0.25 ? "#f59e0b" : colors.destructive;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={() => router.back()}
        >
          <Feather name="x" size={22} color={colors.mutedForeground} />
        </Pressable>
        <View style={styles.timerWrap}>
          <Text style={[styles.timerNum, { color: timerColor }]}>{test.timeLeft}</Text>
          <Text style={[styles.timerLabel, { color: colors.mutedForeground }]}>sec</Text>
        </View>
        <View style={styles.wpmWrap}>
          <Text style={[styles.wpmNum, { color: colors.primary }]}>{test.wpm}</Text>
          <Text style={[styles.wpmLabel, { color: colors.mutedForeground }]}>WPM</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.card }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${(1 - timerPercent) * 100}%`, backgroundColor: timerColor },
          ]}
        />
      </View>

      {/* Countdown overlay */}
      {test.phase === "countdown" && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={[styles.countdownOverlay, { backgroundColor: `${colors.background}ee` }]}
        >
          <Text style={[styles.countdownNum, { color: colors.primary }]}>{test.countdown}</Text>
          <Text style={[styles.countdownLabel, { color: colors.mutedForeground }]}>Get ready!</Text>
        </Animated.View>
      )}

      {/* Idle state */}
      {test.phase === "idle" && (
        <View style={styles.idleCenter}>
          <Pressable
            style={({ pressed }) => [
              styles.startBtnBig,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={test.start}
          >
            <Feather name="play" size={28} color="#fff" />
            <Text style={styles.startBtnText}>Start</Text>
          </Pressable>
          <Text style={[styles.idleHint, { color: colors.mutedForeground }]}>
            {duration}s typing test
          </Text>
        </View>
      )}

      {/* Word display */}
      {(test.phase === "running" || test.phase === "finished") && (
        <Animated.View style={[styles.wordArea, shakeStyle]}>
          <View style={styles.wordWrap}>
            {visibleWords.map((word, idx) => {
              const absIdx = startWordIndex + idx;
              const isCurrent = absIdx === test.currentWordIndex;
              const isPast = absIdx < test.currentWordIndex;
              const pastResult = isPast ? test.completedWords[absIdx] : null;

              return (
                <View key={`${absIdx}-${word}`} style={styles.wordItem}>
                  {isCurrent ? (
                    <>
                      {word.split("").map((char, ci) => {
                        const typed = test.currentInput[ci];
                        let charColor = colors.mutedForeground;
                        if (typed !== undefined) {
                          charColor = typed === char ? colors.success : colors.destructive;
                        }
                        return (
                          <Text key={ci} style={[styles.char, { color: charColor }]}>
                            {char}
                          </Text>
                        );
                      })}
                      {test.currentInput.length > word.length &&
                        test.currentInput.slice(word.length).split("").map((ec, ei) => (
                          <Text key={`extra-${ei}`} style={[styles.char, { color: colors.destructive }]}>
                            {ec}
                          </Text>
                        ))}
                      <View style={[styles.cursor, { backgroundColor: colors.primary }]} />
                    </>
                  ) : isPast && pastResult ? (
                    <Text
                      style={[
                        styles.pastWord,
                        {
                          color: pastResult.correct
                            ? `${colors.success}99`
                            : `${colors.destructive}80`,
                          textDecorationLine: pastResult.correct ? "none" : "line-through",
                        },
                      ]}
                    >
                      {word}
                    </Text>
                  ) : (
                    <Text style={[styles.upcomingWord, { color: `${colors.foreground}55` }]}>
                      {word}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* Accuracy display */}
      {test.phase === "running" && (
        <Text style={[styles.accuracyText, { color: colors.mutedForeground }]}>
          {test.accuracy}% accuracy
        </Text>
      )}

      {/* Hidden input */}
      {test.phase === "running" && (
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={test.currentInput}
          onChangeText={handleInput}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="next"
          blurOnSubmit={false}
          testID="typing-input"
        />
      )}

      {/* Restart button */}
      {test.phase === "running" && (
        <Pressable
          style={({ pressed }) => [
            styles.restartBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
              bottom: insets.bottom + 24,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            test.reset();
          }}
        >
          <Feather name="refresh-cw" size={16} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  timerWrap: {
    flex: 1,
    alignItems: "center",
  },
  timerNum: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 52,
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  wpmWrap: {
    width: 60,
    alignItems: "flex-end",
  },
  wpmNum: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  wpmLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  progressTrack: {
    height: 3,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  countdownNum: {
    fontSize: 80,
    fontWeight: "900",
    letterSpacing: -4,
  },
  countdownLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  idleCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  startBtnBig: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    gap: 12,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  idleHint: {
    fontSize: 14,
  },
  wordArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  wordWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignContent: "flex-start",
  },
  wordItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  char: {
    fontSize: 22,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "Courier New", android: "monospace", default: "monospace" }),
    letterSpacing: 0.5,
  },
  pastWord: {
    fontSize: 22,
    fontFamily: Platform.select({ ios: "Courier New", android: "monospace", default: "monospace" }),
    letterSpacing: 0.5,
  },
  upcomingWord: {
    fontSize: 22,
    fontFamily: Platform.select({ ios: "Courier New", android: "monospace", default: "monospace" }),
    letterSpacing: 0.5,
  },
  cursor: {
    width: 2,
    height: 22,
    marginLeft: 1,
    borderRadius: 1,
  },
  accuracyText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
    paddingBottom: 100,
  },
  hiddenInput: {
    position: "absolute",
    bottom: -100,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0,
  },
  restartBtn: {
    position: "absolute",
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
