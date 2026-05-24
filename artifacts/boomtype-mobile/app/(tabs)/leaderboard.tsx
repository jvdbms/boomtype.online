import { Feather } from "@expo/vector-icons";
import {
  getGetMyLeaderboardRankQueryKey,
  useGetLeaderboard,
  useGetMyLeaderboardRank,
} from "@workspace/api-client-react";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { getLevel, getLevelColor } from "@/constants/words";

type Period = "daily" | "weekly" | "all_time";

const PERIODS: { label: string; value: Period }[] = [
  { label: "Today", value: "daily" },
  { label: "Week", value: "weekly" },
  { label: "All Time", value: "all_time" },
];

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#c96a30"];
const RANK_ICONS = ["award", "award", "award"] as const;

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { nickname: myNickname } = useUser();
  const [period, setPeriod] = useState<Period>("all_time");
  const normalizedMyNickname = myNickname.trim().toLowerCase();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, isError, refetch, isFetching } = useGetLeaderboard(
    { period, limit: 25 }
  );

  const trimmedNickname = myNickname.trim();
  const {
    data: myRank,
    refetch: refetchMyRank,
  } = useGetMyLeaderboardRank(
    { nickname: trimmedNickname, period },
    {
      query: {
        enabled: trimmedNickname.length > 0,
        queryKey: getGetMyLeaderboardRankQueryKey({
          nickname: trimmedNickname,
          period,
        }),
      },
    }
  );

  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? "";

  const handleRefresh = () => {
    refetch();
    if (trimmedNickname.length > 0) refetchMyRank();
  };

  const renderMyRankCard = () => {
    if (trimmedNickname.length === 0) return null;
    const hasScore = myRank?.bestWpm != null && myRank.rank != null;
    return (
      <View
        style={[
          styles.myCard,
          {
            backgroundColor: colors.card,
            borderColor: hasScore ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.myCardHeader}>
          <Text style={[styles.myCardTitle, { color: colors.mutedForeground }]}>
            YOUR {periodLabel.toUpperCase()} STANDING
          </Text>
          <Text style={[styles.myCardName, { color: colors.foreground }]} numberOfLines={1}>
            {trimmedNickname}
          </Text>
        </View>
        {hasScore ? (
          <View style={styles.myCardStats}>
            <View style={styles.myStat}>
              <Text style={[styles.myStatValue, { color: colors.primary }]}>
                #{myRank!.rank}
              </Text>
              <Text style={[styles.myStatLabel, { color: colors.mutedForeground }]}>
                {myRank!.totalPlayers > 0
                  ? `of ${myRank!.totalPlayers}`
                  : "RANK"}
              </Text>
            </View>
            <View style={[styles.myDivider, { backgroundColor: colors.border }]} />
            <View style={styles.myStat}>
              <Text style={[styles.myStatValue, { color: colors.foreground }]}>
                {Math.round(myRank!.bestWpm!)}
              </Text>
              <Text style={[styles.myStatLabel, { color: colors.mutedForeground }]}>
                BEST WPM
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.myEmpty}>
            <Feather name="zap" size={18} color={colors.mutedForeground} />
            <Text style={[styles.myEmptyText, { color: colors.mutedForeground }]}>
              {period === "all_time"
                ? "Take a test to claim your spot on the board"
                : `No scores ${period === "daily" ? "today" : "this week"} — run a test to get on the board`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Leaderboard</Text>
        <View style={[styles.periodRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PERIODS.map((p) => {
            const active = period === p.value;
            return (
              <Pressable
                key={p.value}
                style={[
                  styles.periodBtn,
                  active && { backgroundColor: colors.primary },
                ]}
                onPress={() => setPeriod(p.value)}
              >
                <Text
                  style={[
                    styles.periodLabel,
                    { color: active ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Couldn't load leaderboard
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => `${item.rank}-${item.nickname}`}
          scrollEnabled={!!(data && data.length > 0)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 + insets.bottom, paddingTop: 8 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={renderMyRankCard()}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Feather name="list" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No scores yet for this period
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isTop3 = item.rank <= 3;
            const rankColor = isTop3 ? RANK_COLORS[item.rank - 1] : colors.mutedForeground;
            const levelColor = getLevelColor(item.wpm);
            const isMe =
              !!normalizedMyNickname &&
              item.nickname.trim().toLowerCase() === normalizedMyNickname;
            return (
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: isMe
                      ? colors.primaryLight
                      : isTop3
                      ? colors.card
                      : "transparent",
                    borderColor: isMe
                      ? colors.primary
                      : isTop3
                      ? colors.border
                      : "transparent",
                    marginHorizontal: 16,
                    marginBottom: 8,
                  },
                ]}
              >
                <View style={[styles.rankWrap, isTop3 && { backgroundColor: `${rankColor}22` }]}>
                  {isTop3 ? (
                    <Feather name={RANK_ICONS[item.rank - 1]} size={16} color={rankColor} />
                  ) : (
                    <Text style={[styles.rankNum, { color: colors.mutedForeground }]}>
                      {item.rank}
                    </Text>
                  )}
                </View>
                <View style={styles.nameWrap}>
                  <View style={styles.nicknameRow}>
                    <Text style={[styles.nickname, { color: colors.foreground }]} numberOfLines={1}>
                      {item.nickname}
                    </Text>
                    {isMe && (
                      <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.youBadgeText, { color: colors.primaryForeground }]}>
                          YOU
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={[styles.level, { color: levelColor }]}>{getLevel(item.wpm)}</Text>
                    <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                      {item.testsCount} test{item.testsCount !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <View style={styles.scoreWrap}>
                  <Text style={[styles.wpm, { color: colors.primary }]}>{Math.round(item.wpm)}</Text>
                  <Text style={[styles.wpmLabel, { color: colors.mutedForeground }]}>WPM</Text>
                </View>
                <View style={styles.accWrap}>
                  <Text style={[styles.acc, { color: colors.foreground }]}>
                    {Math.round(item.accuracy)}%
                  </Text>
                  <Text style={[styles.accLabel, { color: colors.mutedForeground }]}>ACC</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  periodRow: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
  },
  myCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  myCardHeader: {
    gap: 2,
  },
  myCardTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  myCardName: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  myCardStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  myStat: {
    flex: 1,
    gap: 2,
  },
  myStatValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  myStatLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  myDivider: {
    width: 1,
    alignSelf: "stretch",
  },
  myEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  myEmptyText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  rankWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNum: {
    fontSize: 13,
    fontWeight: "700",
  },
  nameWrap: {
    flex: 1,
    gap: 2,
  },
  nicknameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nickname: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  level: {
    fontSize: 11,
    fontWeight: "600",
  },
  meta: {
    fontSize: 11,
  },
  scoreWrap: {
    alignItems: "flex-end",
  },
  wpm: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  wpmLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  accWrap: {
    alignItems: "flex-end",
    minWidth: 40,
  },
  acc: {
    fontSize: 14,
    fontWeight: "700",
  },
  accLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
