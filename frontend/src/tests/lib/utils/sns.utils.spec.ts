import { AccountIdentifier, ICP } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsMetadataResponseEntries, SnsSwapLifecycle } from "@dfinity/sns";
import type { BuyerState } from "@dfinity/sns/dist/candid/sns_swap";
import type { SnsFullProject } from "../../../lib/stores/projects.store";
import type { SnsSwapCommitment } from "../../../lib/types/sns";
import {
  getSwapCanisterAccount,
  mapAndSortSnsQueryToSummaries,
  validParticipation,
} from "../../../lib/utils/sns.utils";
import { mockIdentity } from "../../mocks/auth.store.mock";
import {
  mockDerived,
  mockQueryMetadata,
  mockQueryMetadataResponse,
  mockSnsFullProject,
  mockSnsSummaryList,
  mockSummary,
  mockSwapInit,
  mockSwapState,
  principal,
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

    it("should return empty for partially undefined metadata", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [
          {
            ...mockQueryMetadata,
            metadata: {
              ...mockQueryMetadataResponse,
              name: [],
            },
          },
        ],
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

      expect(summaries.length).toEqual(0);
    });

    it("should return empty for partially undefined token", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [
          {
            ...mockQueryMetadata,
            token: [[SnsMetadataResponseEntries.DECIMALS, { Nat: BigInt(8) }]],
          },
        ],
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

      expect(summaries.length).toEqual(0);
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

  describe("validParticipation", () => {
    const validAmountE8s = BigInt(1_000_000_000);
    const validProject: SnsFullProject = {
      ...mockSnsFullProject,
      summary: {
        ...mockSnsFullProject.summary,
        swap: {
          ...mockSnsFullProject.summary.swap,
          state: {
            ...mockSnsFullProject.summary.swap.state,
            lifecycle: SnsSwapLifecycle.Open,
          },
          init: {
            ...mockSnsFullProject.summary.swap.init,
            min_participant_icp_e8s: validAmountE8s - BigInt(10_000),
            max_participant_icp_e8s: validAmountE8s + BigInt(10_000),
            max_icp_e8s: validAmountE8s + BigInt(10_000),
          },
        },
      },
      swapCommitment: {
        ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
        myCommitment: {
          ...(mockSnsFullProject.swapCommitment?.myCommitment as BuyerState),
          amount_icp_e8s: BigInt(0),
        },
      },
    };
    it("returns true if valid participation", () => {
      const { valid } = validParticipation({
        project: validProject,
        amount: ICP.fromE8s(validAmountE8s),
      });
      expect(valid).toBe(true);
    });

    it("returns false if project committed", () => {
      const project = {
        ...validProject,
        summary: {
          ...validProject.summary,
          swap: {
            ...validProject.summary.swap,
            state: {
              ...validProject.summary.swap.state,
              lifecycle: SnsSwapLifecycle.Committed,
            },
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: ICP.fromE8s(validAmountE8s),
      });
      expect(valid).toBe(false);
    });

    it("returns false if project pending", () => {
      const project = {
        ...validProject,
        summary: {
          ...validProject.summary,
          swap: {
            ...validProject.summary.swap,
            state: {
              ...validProject.summary.swap.state,
              lifecycle: SnsSwapLifecycle.Pending,
            },
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: ICP.fromE8s(validAmountE8s),
      });
      expect(valid).toBe(false);
    });

    it("returns false if amount is larger than maximum per participant", () => {
      const project = {
        ...validProject,
        summary: {
          ...validProject.summary,
          swap: {
            ...validProject.summary.swap,
            init: {
              ...validProject.summary.swap.init,
              max_participant_icp_e8s: validAmountE8s,
            },
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: ICP.fromE8s(validAmountE8s + BigInt(10_000)),
      });
      expect(valid).toBe(false);
    });

    it("takes into account current participation to calculate the maximum per participant", () => {
      const project = {
        ...validProject,
        summary: {
          ...validProject.summary,
          swap: {
            ...validProject.summary.swap,
            init: {
              ...validProject.summary.swap.init,
              max_participant_icp_e8s: validAmountE8s * BigInt(2),
            },
          },
        },
        swapCommitment: {
          ...(validProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            ...(validProject.swapCommitment?.myCommitment as BuyerState),
            amount_icp_e8s: validAmountE8s,
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: ICP.fromE8s(validAmountE8s + BigInt(10_000)),
      });
      expect(valid).toBe(false);
    });
  });
});
