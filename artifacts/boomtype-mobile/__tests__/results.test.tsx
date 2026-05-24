import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";

const mockSubmitScore = jest.fn();
const mockState = {
  capturedOptions: null as any,
  isPending: false,
};

jest.mock("@workspace/api-client-react", () => ({
  useSubmitScore: () => ({
    mutate: (vars: any, opts: any) => {
      mockState.capturedOptions = opts;
      mockSubmitScore(vars, opts);
    },
    isPending: mockState.isPending,
  }),
}));

const mockUserState = {
  nickname: "alice",
  totalXP: 100,
  highScore: 40,
  hapticsEnabled: false,
  soundEnabled: false,
  addXP: jest.fn(() => Promise.resolve()),
  updateStreak: jest.fn(() => Promise.resolve(0)),
  setHighScore: jest.fn(() => Promise.resolve()),
};

jest.mock("@/context/UserContext", () => ({
  useUser: () => mockUserState,
}));

const { useLocalSearchParams } = require("expo-router");
(useLocalSearchParams as jest.Mock).mockReturnValue({
  wpm: "55",
  accuracy: "92",
  mistakes: "3",
  duration: "30",
  correct: "27",
  total: "30",
});

import ResultsScreen from "../app/results";

describe("Results screen score submission", () => {
  beforeEach(() => {
    mockSubmitScore.mockClear();
    mockState.capturedOptions = null;
    mockState.isPending = false;
    mockUserState.nickname = "alice";
  });

  it("submits the score to the leaderboard with the correct payload", async () => {
    render(<ResultsScreen />);

    await waitFor(() => {
      expect(mockSubmitScore).toHaveBeenCalledTimes(1);
    });

    const [vars] = mockSubmitScore.mock.calls[0];
    expect(vars).toEqual({
      data: {
        nickname: "alice",
        wpm: 55,
        accuracy: 92,
        duration: 30,
        mistakes: 3,
      },
    });
  });

  it("shows an error state when submission fails", async () => {
    const { findByText } = render(<ResultsScreen />);

    await waitFor(() => {
      expect(mockState.capturedOptions).not.toBeNull();
    });

    await act(async () => {
      mockState.capturedOptions.onError(new Error("network down"));
    });

    expect(await findByText(/couldn't submit score/i)).toBeTruthy();
  });

  it("shows a success state when submission succeeds", async () => {
    const { findByText } = render(<ResultsScreen />);

    await waitFor(() => {
      expect(mockState.capturedOptions).not.toBeNull();
    });

    await act(async () => {
      mockState.capturedOptions.onSuccess();
    });

    expect(await findByText(/score submitted to leaderboard/i)).toBeTruthy();
  });

  it("does not submit when nickname is empty", async () => {
    mockUserState.nickname = "";
    render(<ResultsScreen />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });

    expect(mockSubmitScore).not.toHaveBeenCalled();
  });
});
