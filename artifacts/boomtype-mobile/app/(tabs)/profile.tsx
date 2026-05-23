import { Feather } from "@expo/vector-icons";
import { getGetUserProfileQueryKey, useGetUserProfile } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatBadge } from "@/components/StatBadge";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";
import { getLevel, getLevelColor, getXPLevel } from "@/constants/words";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    nickname,
    totalXP,
    streak,
    highScore,
    hapticsEnabled,
    soundEnabled,
    loaded,
    setNickname,
    setHapticsEnabled,
    setSoundEnabled,
    resetProgress,
  } = useUser();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(nickname);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: profile, isFetching, refetch } = useGetUserProfile(
    nickname,
    {
      query: {
        queryKey: getGetUserProfileQueryKey(nickname),
        enabled: !!nickname,
      },
    }
  );

  const openEditor = () => {
    setInput(nickname);
    setError("");
    setEditing(true);
  };

  const handleSave = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a nickname");
      return;
    }
    if (trimmed.length < 2) {
      setError("Nickname must be at least 2 characters");
      return;
    }
    if (trimmed.length > 20) {
      setError("Nickname must be 20 characters or less");
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setNickname(trimmed);
    setEditing(false);
    refetch();
  };

  const confirmReset = () => {
    if (Platform.OS === "web") {
      const ok = typeof window !== "undefined" && window.confirm("Reset all progress? This will clear your nickname, XP, streak, and best WPM. This can't be undone.");
      if (ok) void doReset();
      return;
    }
    Alert.alert(
      "Reset progress?",
      "This will clear your nickname, XP, streak, and best WPM on this device. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => void doReset() },
      ]
    );
  };

  const doReset = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await resetProgress();
  };

  const level = getLevel(highScore);
  const levelColor = getLevelColor(highScore);
  const xpLevel = getXPLevel(totalXP);

  if (!loaded) return <View style={[styles.root, { backgroundColor: colors.background }]} />;

  const recentScores = profile?.recentScores ?? [];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad + 8, paddingBottom: 60 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Profile</Text>

        {/* Identity card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Feather name="user" size={32} color={colors.primary} />
          </View>
          <View style={styles.identityText}>
            <Text style={[styles.nickname, { color: colors.foreground }]} numberOfLines={1}>
              {nickname || "No nickname set"}
            </Text>
            <Text style={[styles.subText, { color: colors.mutedForeground }]}>
              {nickname ? "Tap edit to change" : "Set one to appear on the leaderboard"}
            </Text>
          </View>
          <Pressable
            onPress={openEditor}
            style={({ pressed }) => [
              styles.editBtn,
              { backgroundColor: colors.primaryLight, opacity: pressed ? 0.7 : 1 },
            ]}
            testID="edit-nickname-btn"
          >
            <Feather name="edit-2" size={16} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>
              {nickname ? "Edit" : "Set"}
            </Text>
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
          <StatBadge
            label="Total XP"
            value={totalXP > 999 ? `${Math.floor(totalXP / 1000)}k` : totalXP}
            color={colors.success}
          />
        </View>

        {/* Level card */}
        <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.levelRow}>
            <View style={styles.levelLeft}>
              <View style={[styles.levelChip, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.levelChipText, { color: colors.primary }]}>
                  LVL {xpLevel.level}
                </Text>
              </View>
              {highScore > 0 && (
                <View style={styles.tierWrap}>
                  <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
                  <Text style={[styles.levelText, { color: levelColor }]}>{level}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.xpToNext, { color: colors.mutedForeground }]}>
              {xpLevel.xpToNext} XP to LVL {xpLevel.level + 1}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(4, xpLevel.progress * 100)}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.progressMeta, { color: colors.mutedForeground }]}>
            {xpLevel.xpInLevel} / 500 XP this level
          </Text>
        </View>

        {/* Recent history */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Recent tests</Text>
        <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!nickname ? (
            <View style={styles.emptyState}>
              <Feather name="bar-chart-2" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Set a nickname and complete a test to see your history.
              </Text>
            </View>
          ) : isFetching && recentScores.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Loading…</Text>
            </View>
          ) : recentScores.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="bar-chart-2" size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No tests yet. Take one to fill this up!
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.push("/")}
              >
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                  Start a test
                </Text>
              </Pressable>
            </View>
          ) : (
            recentScores.slice(0, 8).map((s, idx) => {
              const c = getLevelColor(s.wpm);
              return (
                <View
                  key={s.id}
                  style={[
                    styles.historyRow,
                    idx < Math.min(recentScores.length, 8) - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                  ]}
                >
                  <View style={[styles.historyDot, { backgroundColor: c }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyWpm, { color: colors.foreground }]}>
                      {Math.round(s.wpm)} WPM
                    </Text>
                    <Text style={[styles.historyMeta, { color: colors.mutedForeground }]}>
                      {Math.round(s.accuracy)}% acc · {s.duration}s · {formatDate(s.createdAt)}
                    </Text>
                  </View>
                  <Text style={[styles.historyLevel, { color: c }]}>{getLevel(s.wpm)}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Settings */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>Settings</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="smartphone" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Keystroke haptics</Text>
              <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>
                Vibrate as you type during a test
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={async (v) => {
                if (v) {
                  try { await Haptics.selectionAsync(); } catch {}
                }
                await setHapticsEnabled(v);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === "android" ? (hapticsEnabled ? colors.primaryForeground : colors.mutedForeground) : undefined}
              testID="haptics-toggle"
            />
          </View>
          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.accentLight ?? colors.primaryLight }]}>
              <Feather name="volume-2" size={16} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Sound effects</Text>
              <Text style={[styles.settingSub, { color: colors.mutedForeground }]}>
                Play sounds for celebrations and wins
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={(v) => { void setSoundEnabled(v); }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === "android" ? (soundEnabled ? colors.primaryForeground : colors.mutedForeground) : undefined}
              testID="sound-toggle"
            />
          </View>
        </View>

        {/* Danger zone */}
        <Text style={[styles.sectionLabel, { color: colors.destructive, marginTop: 24 }]}>Danger zone</Text>
        <Pressable
          onPress={confirmReset}
          style={({ pressed }) => [
            styles.dangerBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.destructive,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
          testID="reset-progress-btn"
        >
          <Feather name="trash-2" size={18} color={colors.destructive} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dangerTitle, { color: colors.destructive }]}>Reset progress</Text>
            <Text style={[styles.dangerSub, { color: colors.mutedForeground }]}>
              Clears nickname, XP, streak, and best WPM on this device.
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Inline nickname editor (reuses NicknameModal logic) */}
      <Modal visible={editing} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.card, borderColor: colors.border, marginBottom: insets.bottom + 20 },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
              <Feather name="user" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {nickname ? "Edit nickname" : "Choose a nickname"}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
              Your nickname appears on the leaderboard
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  borderColor: error ? colors.destructive : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="e.g. SpeedDemon99"
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={(t) => { setInput(t); setError(""); }}
              maxLength={20}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
            {!!error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
            <View style={styles.modalBtnRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 1,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={() => setEditing(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={handleSave}
              >
                <Text style={[styles.modalBtnText, { color: colors.primaryForeground }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString();
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  identityText: { flex: 1, gap: 2 },
  nickname: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
  subText: { fontSize: 12 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  editBtnText: { fontSize: 13, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 14,
  },
  levelCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  levelLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  levelChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelChipText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  tierWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  levelDot: { width: 8, height: 8, borderRadius: 4 },
  levelText: { fontSize: 13, fontWeight: "700" },
  xpToNext: { fontSize: 11, fontWeight: "600" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressMeta: { fontSize: 11, fontWeight: "500" },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 16,
  },
  historyCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  historyWpm: { fontSize: 15, fontWeight: "700" },
  historyMeta: { fontSize: 12, marginTop: 2 },
  historyLevel: { fontSize: 12, fontWeight: "700" },
  emptyState: { alignItems: "center", padding: 24, gap: 10 },
  emptyText: { fontSize: 13, textAlign: "center" },
  primaryBtn: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: { fontSize: 13, fontWeight: "700" },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingsCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: { fontSize: 14, fontWeight: "700" },
  settingSub: { fontSize: 12, marginTop: 2 },
  settingDivider: { height: 1, marginLeft: 58 },
  dangerTitle: { fontSize: 14, fontWeight: "700" },
  dangerSub: { fontSize: 12, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
    padding: 16,
  },
  modalContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  modalSubtitle: { fontSize: 14, textAlign: "center" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  error: { fontSize: 13, fontWeight: "500" },
  modalBtnRow: { flexDirection: "row", gap: 10, width: "100%" },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnText: { fontSize: 15, fontWeight: "700" },
});
