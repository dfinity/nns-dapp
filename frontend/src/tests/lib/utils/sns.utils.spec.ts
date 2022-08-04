import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  getSwapCanisterAccount,
  mapAndSortSnsQueryToSummaries,
} from "../../../lib/utils/sns.utils";
import { mockIdentity } from "../../mocks/auth.store.mock";
import {
  mockDerived, mockQueryMetadata,
  mockSnsSummaryList,
  mockSummary,
  mockSwapInit,
  mockSwapState, principal,
} from "../../mocks/sns-projects.mock";
import { rootCanisterIdMock } from "../../mocks/sns.api.mock";

describe("sns-utils", () => {
  describe("concat sns summaries", () => {
    it("should return empty for undefined summary", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [],
        swaps: [],
      });

      expect(summaries.length).toEqual(0);
    });

    it("should return empty for undefined swap query", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [mockQueryMetadata],
        swaps: [],
      });

      expect(summaries.length).toEqual(0);
    });

    it("should return empty for undefined swap init", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [mockQueryMetadata],
        swaps: [
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [],
                state: [],
              },
            ],
            derived: [mockDerived],
            certified: true,
          },
        ],
      });

      expect(summaries.length).toEqual(0);
    });

    it("should return empty for undefined swap state", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [mockQueryMetadata],
        swaps: [
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [],
              },
            ],
            derived: [mockDerived],
            certified: true,
          },
        ],
      });

      expect(summaries.length).toEqual(0);
    });

    it("should return empty for undefined derived info", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [mockQueryMetadata],
        swaps: [
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [mockSwapState],
              },
            ],
            derived: [],
            certified: true,
          },
        ],
      });

      expect(summaries.length).toEqual(0);
    });

    it("should return empty if no root id are matching between summaries and swaps", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [mockQueryMetadata],
        swaps: [
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [mockSwapState],
              },
            ],
            derived: [mockDerived],
            certified: true,
          },
        ],
      });

      expect(summaries.length).toEqual(0);
    });

    it("should concat summaries and swaps", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [mockQueryMetadata],
        swaps: [
          {
            rootCanisterId: mockSummary.rootCanisterId.toText(),
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                init: [mockSwapInit],
                state: [mockSwapState],
              },
            ],
            derived: [mockDerived],
            certified: true,
          },
        ],
      });

      expect(summaries.length).toEqual(1);
    });
  });

  describe("sort sns summaries", () => {
    it("should sort summaries and swaps", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [
          mockQueryMetadata,
          { ...mockQueryMetadata, rootCanisterId: principal(1).toText() },
        ],
        swaps: [
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
            derived: [mockDerived],
            certified: true,
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
            derived: [mockDerived],
            certified: true,
          },
        ],
      });

      expect(summaries.length).toEqual(2);

      expect(summaries[0].rootCanisterId.toText()).toEqual(
        mockSnsSummaryList[1].rootCanisterId.toText()
      );
    });
  });

  describe("getSwapCanisterAccount", () => {
    it("should return swap canister account", async () => {
      const expectedAccount = await getSwapCanisterAccount({
        swapCanisterId: rootCanisterIdMock,
        controller: mockIdentity.getPrincipal(),
      });
      expect(expectedAccount).toBeInstanceOf(AccountIdentifier);
    });
  });
});
