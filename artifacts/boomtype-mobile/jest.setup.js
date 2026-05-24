/* global jest */

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
}));

jest.mock("expo-audio", () => ({
  useAudioPlayer: () => ({
    play: jest.fn(),
    seekTo: jest.fn(),
    pause: jest.fn(),
  }),
}));

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: React.forwardRef((props, ref) =>
      React.createElement(View, { ...props, ref })
    ),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const Icon = (props) =>
    React.createElement(Text, { accessibilityLabel: `icon-${props.name}` }, "");
  return { Feather: Icon, Ionicons: Icon, MaterialIcons: Icon };
});

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
  Link: ({ children }) => children,
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock("@/components/Confetti", () => ({
  Confetti: () => null,
}));

jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 320, height: 640 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
  };
});

jest.mock("@/hooks/useColors", () => ({
  useColors: () => ({
    background: "#000",
    foreground: "#fff",
    mutedForeground: "#888",
    primary: "#3b7af7",
    primaryLight: "#3b7af722",
    primaryForeground: "#fff",
    accent: "#8853e0",
    accentLight: "#8853e022",
    card: "#111",
    border: "#222",
    destructive: "#ef4444",
    success: "#22c55e",
    radius: 8,
  }),
}));
