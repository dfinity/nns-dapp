import { Principal } from "@dfinity/principal";
import {
  concatSnsSummaries,
  concatSnsSummary,
} from "../../../lib/utils/sns.utils";
import {
  mockSnsSummaryList,
  mockSummary,
  mockSwap,
  mockSwapInit,
  mockSwapState,
} from "../../mocks/sns-projects.mock";

describe("sns-utils", () => {
  describe("concat sns summaries", () => {
    it("should return empty for undefined summary", () => {
      const summaries = concatSnsSummaries([[], []]);

      expect(summaries.length).toEqual(0);
    });

    it("should return empty for undefined swap query", () => {
      const summaries = concatSnsSummaries([[mockSummary], []]);

      expect(summaries.length).toEqual(0);
    });

    it("should return empty for undefined swap init", () => {
      const summaries = concatSnsSummaries([
        [mockSummary],
        [
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [],
                state: [],
              },
            ],
          },
        ],
      ]);

      expect(summaries.length).toEqual(0);
    });

    it("should return empty for undefined swap state", () => {
      const summaries = concatSnsSummaries([
        [mockSummary],
        [
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [],
              },
            ],
          },
        ],
      ]);

      expect(summaries.length).toEqual(0);
    });

    it("should return empty if no root id are matching between summaries and swaps", () => {
      const summaries = concatSnsSummaries([
        [mockSummary],
        [
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [mockSwapState],
              },
            ],
          },
        ],
      ]);

      expect(summaries.length).toEqual(0);
    });

    it("should concat summaries and swaps", () => {
      const summaries = concatSnsSummaries([
        [mockSummary],
        [
          {
            rootCanisterId: mockSummary.rootCanisterId.toText(),
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [mockSwapState],
              },
            ],
          },
        ],
      ]);

      expect(summaries.length).toEqual(1);
    });
  });

  describe("sort sns summaries", () => {
    it("should sort summaries and swaps", () => {
      const summaries = concatSnsSummaries([
        [mockSummary, mockSnsSummaryList[1]],
        [
          {
            rootCanisterId: mockSummary.rootCanisterId.toText(),
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [
                  {
                    ...mockSwapState,
                    open_time_window: [
                      {
                        start_timestamp_seconds: BigInt(4),
                        end_timestamp_seconds: BigInt(5),
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            rootCanisterId: mockSnsSummaryList[1].rootCanisterId.toText(),
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [
                  {
                    ...mockSwapState,
                    open_time_window: [
                      {
                        start_timestamp_seconds: BigInt(1),
                        end_timestamp_seconds: BigInt(2),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      ]);

      expect(summaries.length).toEqual(2);

      expect(summaries[0].rootCanisterId.toText()).toEqual(
        mockSnsSummaryList[1].rootCanisterId.toText()
      );
    });
  });

  describe("concat a sns summary", () => {
    it("should throw error for undefined summary", () => {
      const call = () => concatSnsSummary([undefined, undefined]);

      expect(call).toThrow();
    });

    it("should throw error for undefined swap query", () => {
      const call = () => concatSnsSummary([mockSummary, undefined]);

      expect(call).toThrow();
    });

    it("should throw error for undefined swap init", () => {
      const call = () =>
        concatSnsSummary([
          mockSummary,
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [],
                state: [],
              },
            ],
          },
        ]);

      expect(call).toThrow();
    });

    it("should throw error for undefined swap state", () => {
      const call = () =>
        concatSnsSummary([
          mockSummary,
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [],
              },
            ],
          },
        ]);

      expect(call).toThrow();
    });
    it("should concat summary and swap", () => {
      const swapCanisterId = Principal.fromText("aaaaa-aa");
      const summary = concatSnsSummary([
        mockSummary,
        {
          rootCanisterId: "1234",
          swapCanisterId,
          swap: [
            {
              init: [mockSwapInit],
              state: [mockSwapState],
            },
          ],
        },
      ]);

      expect(summary).toEqual({
        ...mockSummary,
        swap: mockSwap,
        swapCanisterId,
      });
    });
  });
});
