import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";

interface NicknameModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function NicknameModal({ visible, onDismiss }: NicknameModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setNickname } = useUser();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

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
    setInput("");
    setError("");
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: colors.card, borderColor: colors.border, marginBottom: insets.bottom + 20 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
            <Feather name="user" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Choose a nickname</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
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
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleSave}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Save nickname</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
    padding: 16,
  },
  container: {
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  error: {
    fontSize: 13,
    fontWeight: "500",
  },
  btn: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
