module.exports = {
  preset: "jest-expo",
  setupFiles: [
    require.resolve("react-native/jest/setup"),
    "<rootDir>/jest.setup.js",
  ],
  testMatch: ["<rootDir>/__tests__/**/*.test.(ts|tsx)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(wav|mp3|ogg|m4a|aac|flac|png|jpg|jpeg|gif|webp|svg|ttf|otf)$":
      "<rootDir>/__tests__/__mocks__/fileMock.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!.*(react-native|@react-native|@react-navigation|expo|@expo|@unimodules|unimodules|sentry-expo|native-base|@workspace))",
  ],
};
