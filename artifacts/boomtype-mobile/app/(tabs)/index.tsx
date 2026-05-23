import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NicknameModal } from "@/components/NicknameModal";
import { StatBadge } from "@/components/StatBadge";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";
import { getLevel, getLevelColor } from "@/constants/words";

const DURATIONS = [
  { label: "30s", value: 30, icon: "zap" as const },
  { label: "60s", value: 60, icon: "clock" as const },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { nickname, totalXP, streak, highScore, loaded } = useUser();
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [showNickname, setShowNickname] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/test", params: { duration: selectedDuration } });
  };

  const level = getLevel(highScore);
  const levelColor = getLevelColor(highScore);

  if (!loaded) return <View style={[styles.root, { backgroundColor: colors.background }]} />;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 40 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {nickname ? `Welcome back, ${nickname}` : "BoomType"}
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Practice Typing</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.profileBtn,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => setShowNickname(true)}
          >
            <Feather name="user" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBadge label="Best WPM" value={Math.round(highScore) || "—"} color={colors.primary} />
          <StatBadge
            label="Streak"
            value={streak ? `${streak}d` : "—"}
            color={streak >= 7 ? "#f59e0b" : colors.accent}
          />
          <StatBadge label="Total XP" value={totalXP > 999 ? `${Math.floor(totalXP / 1000)}k` : totalXP} color={colors.success} />
        </View>

        {/* Level badge */}
        {highScore > 0 && (
          <View style={[styles.levelBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
            <Text style={[styles.levelText, { color: colors.mutedForeground }]}>
              Level:{" "}
              <Text style={{ color: levelColor, fontWeight: "700" }}>{level}</Text>
            </Text>
          </View>
        )}

        {/* Duration selector */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Test duration</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map((d) => {
            const active = selectedDuration === d.value;
            return (
              <Pressable
                key={d.value}
                style={({ pressed }) => [
                  styles.durationCard,
                  {
                    backgroundColor: active ? colors.primaryLight : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setSelectedDuration(d.value);
                }}
              >
                <Feather name={d.icon} size={22} color={active ? colors.primary : colors.mutedForeground} />
                <Text
                  style={[
                    styles.durationLabel,
                    { color: active ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Start button */}
        <Pressable
          style={({ pressed }) => [styles.startBtn, { opacity: pressed ? 0.88 : 1 }]}
          onPress={handleStart}
          testID="start-test-btn"
        >
          <LinearGradient
            colors={["#3b7af7", "#8853e0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startGradient}
          >
            <Feather name="play" size={20} color="#fff" />
            <Text style={styles.startText}>Start {selectedDuration}s test</Text>
          </LinearGradient>
        </Pressable>

        {/* Quick tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tipsTitle, { color: colors.foreground }]}>Tips</Text>
          {[
            "Type each word followed by a space",
            "Focus on accuracy over speed",
            "Practice daily to build your streak",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {!nickname && (
          <Pressable
            style={({ pressed }) => [
              styles.nicknamePrompt,
              { backgroundColor: colors.accentLight, borderColor: colors.accent, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => setShowNickname(true)}
          >
            <Feather name="award" size={16} color={colors.accent} />
            <Text style={[styles.nicknamePromptText, { color: colors.accent }]}>
              Set a nickname to join the leaderboard
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <NicknameModal visible={showNickname} onDismiss={() => setShowNickname(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  levelBadge: {
    marginHorizontal: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  durationRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  durationCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  startBtn: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  startGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  startText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  tipsCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  nicknamePrompt: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nicknamePromptText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
});
