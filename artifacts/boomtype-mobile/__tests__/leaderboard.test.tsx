import React from "react";
import { render } from "@testing-library/react-native";

const leaderboardData = [
  { rank: 1, nickname: "Zara", wpm: 120, accuracy: 99, testsCount: 12 },
  { rank: 2, nickname: "Alice", wpm: 88, accuracy: 95, testsCount: 8 },
  { rank: 3, nickname: "Bob", wpm: 70, accuracy: 90, testsCount: 4 },
];

jest.mock("@workspace/api-client-react", () => ({
  useGetLeaderboard: () => ({
    data: leaderboardData,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isFetching: false,
  }),
  useGetMyLeaderboardRank: () => ({
    data: { rank: 2, bestWpm: 88, totalPlayers: 3 },
    refetch: jest.fn(),
  }),
  getGetMyLeaderboardRankQueryKey: () => ["my-rank"],
}));

const userState = { nickname: "alice" };

jest.mock("@/context/UserContext", () => ({
  useUser: () => userState,
}));

import LeaderboardScreen from "../app/(tabs)/leaderboard";

describe("Leaderboard YOU badge highlighting", () => {
  beforeEach(() => {
    userState.nickname = "alice";
  });

  it("renders a YOU badge on the row matching the current user's nickname", () => {
    const { getAllByText } = render(<LeaderboardScreen />);

    const youBadges = getAllByText("YOU");
    // One YOU badge — only on the row whose nickname matches.
    expect(youBadges).toHaveLength(1);
  });

  it("applies the highlighted row styling to the current user's row", () => {
    const { getByText, getAllByText } = render(<LeaderboardScreen />);

    // The matching row's nickname.
    const myNicknameNode = getByText("Alice");
    // Walk up to the row container (the View with a backgroundColor/borderColor
    // set by the isMe branch).
    let rowContainer: any = myNicknameNode.parent;
    while (rowContainer) {
      const style = rowContainer.props?.style;
      const flat = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      if (flat && flat.backgroundColor && flat.borderColor) {
        break;
      }
      rowContainer = rowContainer.parent;
    }
    expect(rowContainer).not.toBeNull();
    const rowStyle = Array.isArray(rowContainer.props.style)
      ? Object.assign({}, ...rowContainer.props.style.filter(Boolean))
      : rowContainer.props.style;
    // Highlighted row uses the primary (light) background + primary border.
    expect(rowStyle.backgroundColor).toBe("#3b7af722");
    expect(rowStyle.borderColor).toBe("#3b7af7");

    // A non-matching row (e.g. "Bob", rank 3) should NOT have the
    // highlighted background — it uses the card background (top-3) or
    // transparent (outside top-3) and a non-primary border.
    const otherNickname = getByText("Bob");
    let otherRow: any = otherNickname.parent;
    while (otherRow) {
      const style = otherRow.props?.style;
      const flat = Array.isArray(style)
        ? Object.assign({}, ...style.filter(Boolean))
        : style;
      if (flat && "backgroundColor" in flat && "borderColor" in flat) {
        break;
      }
      otherRow = otherRow.parent;
    }
    const otherStyle = Array.isArray(otherRow.props.style)
      ? Object.assign({}, ...otherRow.props.style.filter(Boolean))
      : otherRow.props.style;
    expect(otherStyle.backgroundColor).not.toBe("#3b7af722");
    expect(otherStyle.borderColor).not.toBe("#3b7af7");
    // Sanity: this is also confirmed by the YOU badge being absent on this row.
    expect(getAllByText("YOU")).toHaveLength(1);
  });

  it("matches case-insensitively and ignores surrounding whitespace", () => {
    userState.nickname = "  ALICE  ";
    const { getAllByText } = render(<LeaderboardScreen />);

    expect(getAllByText("YOU")).toHaveLength(1);
  });

  it("does not render any YOU badges when no row matches", () => {
    userState.nickname = "carol";
    const { queryAllByText } = render(<LeaderboardScreen />);

    expect(queryAllByText("YOU")).toHaveLength(0);
  });

  it("does not render any YOU badges when nickname is empty", () => {
    userState.nickname = "";
    const { queryAllByText } = render(<LeaderboardScreen />);

    expect(queryAllByText("YOU")).toHaveLength(0);
  });
});
