import type { SnsSwapCommitment } from "$lib/types/sns";
import {
  getCommitmentE8s,
  getSwapCanisterAccount,
  mapAndSortSnsQueryToSummaries,
  mapOptionalToken,
} from "$lib/utils/sns.utils";
import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsMetadataResponseEntries } from "@dfinity/sns";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import {
  createBuyersState,
  mockDerived,
  mockQueryMetadata,
  mockQueryMetadataResponse,
  mockQuerySwap,
  mockQueryTokenResponse,
  mockSnsParams,
  mockSnsSummaryList,
  mockSummary,
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

    it("should return empty for undefined params property in the swap", () => {
      const summaries = mapAndSortSnsQueryToSummaries({
        metadata: [mockQueryMetadata],
        swaps: [
          {
            rootCanisterId: "1234",
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            swap: [
              {
                ...mockQuerySwap,
                params: [],
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
            swap: [mockQuerySwap],
            derived: [],
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
            swap: [mockQuerySwap],
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
            swap: [mockQuerySwap],
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
            swap: [mockQuerySwap],
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
                ...mockQuerySwap,
                params: [
                  {
                    ...mockSnsParams,
                    swap_due_timestamp_seconds: BigInt(5),
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
                ...mockQuerySwap,
                params: [
                  {
                    ...mockSnsParams,
                    swap_due_timestamp_seconds: BigInt(2),
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

  describe("mapOptionalToken", () => {
    it("should return token", () => {
      const token = mapOptionalToken(mockQueryTokenResponse);
      expect(token?.name).toBeDefined();
      expect(token?.symbol).toBeDefined();
    });
  });

  describe("getCommitmentE8s", () => {
    it("returns user commitment", () => {
      const commitmentE8s = BigInt(25 * 100000000);
      const commitment: SnsSwapCommitment = {
        rootCanisterId: mockPrincipal,
        myCommitment: createBuyersState(commitmentE8s),
      };
      expect(getCommitmentE8s(commitment)).toEqual(commitmentE8s);
    });

    it("returns undefined if no user commitment", () => {
      const commitment: SnsSwapCommitment = {
        rootCanisterId: mockPrincipal,
        myCommitment: {
          icp: [],
        },
      };
      expect(getCommitmentE8s(commitment)).toBeUndefined();
    });
  });
});
