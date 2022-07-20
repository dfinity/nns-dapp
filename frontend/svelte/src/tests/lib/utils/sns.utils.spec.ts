import { concatSnsSummary } from "../../../lib/utils/sns.utils";
import {
  mockSummary,
  mockSwap,
  mockSwapInit,
  mockSwapState,
} from "../../mocks/sns-projects.mock";

describe("sns-utils", () => {
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
      const summary = concatSnsSummary([
        mockSummary,
        {
          rootCanisterId: "1234",
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
      });
    });
  });
});
