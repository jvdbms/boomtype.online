import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatBadgeProps {
  label: string;
  value: string | number;
  color?: string;
  size?: "sm" | "md";
}

export function StatBadge({ label, value, color, size = "md" }: StatBadgeProps) {
  const colors = useColors();
  const isSmall = size === "sm";

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text
        style={[
          styles.value,
          { color: color ?? colors.primary, fontSize: isSmall ? 22 : 28 },
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground, fontSize: isSmall ? 10 : 11 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  value: {
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  label: {
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
