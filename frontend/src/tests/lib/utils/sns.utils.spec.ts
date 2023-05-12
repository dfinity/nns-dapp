import { snsTicketsStore } from "$lib/stores/sns-tickets.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import {
  getCommitmentE8s,
  getSwapCanisterAccount,
  hasOpenTicketInProcess,
  isInternalRefreshBuyerTokensError,
  mapAndSortSnsQueryToSummaries,
  parseSnsSwapSaleBuyerCount,
} from "$lib/utils/sns.utils";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  createBuyersState,
  mockDerived,
  mockQueryMetadata,
  mockQueryMetadataResponse,
  mockQuerySwap,
  mockSnsParams,
  mockSnsSummaryList,
  mockSummary,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import { IcrcMetadataResponseEntries } from "@dfinity/ledger";
import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("sns-utils", () => {
  beforeEach(() => {
    snsTicketsStore.reset();
  });

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
            governanceCanisterId: Principal.fromText("aaaaa-aa"),
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
            governanceCanisterId: Principal.fromText("aaaaa-aa"),
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
            governanceCanisterId: Principal.fromText("aaaaa-aa"),
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
            governanceCanisterId: Principal.fromText("aaaaa-aa"),
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
            token: [[IcrcMetadataResponseEntries.DECIMALS, { Nat: BigInt(8) }]],
          },
        ],
        swaps: [
          {
            rootCanisterId: mockSummary.rootCanisterId.toText(),
            swapCanisterId: Principal.fromText("aaaaa-aa"),
            governanceCanisterId: Principal.fromText("aaaaa-aa"),
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
            governanceCanisterId: Principal.fromText("aaaaa-aa"),
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
            governanceCanisterId: Principal.fromText("aaaaa-aa"),
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

  describe("getCommitmentE8s", () => {
    it("returns user commitment", () => {
      const commitmentE8s = BigInt(25 * 100000000);
      const commitment: SnsSwapCommitment = {
        rootCanisterId: mockPrincipal,
        myCommitment: createBuyersState(commitmentE8s),
      };
      expect(getCommitmentE8s(commitment)).toEqual(commitmentE8s);
    });

    it("returns 0 if no amount in commitment", () => {
      const commitment: SnsSwapCommitment = {
        rootCanisterId: mockPrincipal,
        myCommitment: {
          icp: [],
        },
      };
      expect(getCommitmentE8s(commitment)).toEqual(BigInt(0));
    });

    it("returns 0 if no user commitment", () => {
      const commitment: SnsSwapCommitment = {
        rootCanisterId: mockPrincipal,
        myCommitment: undefined,
      };
      expect(getCommitmentE8s(commitment)).toEqual(BigInt(0));
    });

    it("returns undefined if commitment not loaded", () => {
      expect(getCommitmentE8s(null)).toBeUndefined();
      expect(getCommitmentE8s(undefined)).toBeUndefined();
    });
  });

  describe("hasOpenTicketInProcess", () => {
    beforeEach(() => {
      snsTicketsStore.reset();
    });
    const testTicket = snsTicketMock({
      rootCanisterId: rootCanisterIdMock,
      owner: mockPrincipal,
    }).ticket;

    it("returns unknown", () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: undefined,
      });
      const store = get(snsTicketsStore);

      expect(
        hasOpenTicketInProcess({
          rootCanisterId: principal(2),
          ticketsStore: store,
        })
      ).toEqual({ status: "unknown" });

      expect(
        hasOpenTicketInProcess({
          rootCanisterId: null,
          ticketsStore: store,
        })
      ).toEqual({ status: "unknown" });

      expect(
        hasOpenTicketInProcess({
          rootCanisterId: undefined,
          ticketsStore: store,
        })
      ).toEqual({ status: "unknown" });
    });

    it("returns polling when the ticket is undefined", () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: undefined,
      });
      const store = get(snsTicketsStore);

      expect(
        hasOpenTicketInProcess({
          rootCanisterId: rootCanisterIdMock,
          ticketsStore: store,
        })
      ).toEqual({ status: "loading" });
    });

    it("returns open when there is an open ticket in the store", () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: testTicket,
      });
      const store = get(snsTicketsStore);

      expect(
        hasOpenTicketInProcess({
          rootCanisterId: rootCanisterIdMock,
          ticketsStore: store,
        })
      ).toEqual({ status: "open" });
    });

    it("returns none when the open ticket is null (processed)", () => {
      snsTicketsStore.setTicket({
        rootCanisterId: rootCanisterIdMock,
        ticket: null,
      });
      const store = get(snsTicketsStore);

      expect(
        hasOpenTicketInProcess({
          rootCanisterId: rootCanisterIdMock,
          ticketsStore: store,
        })
      ).toEqual({ status: "none" });
    });
  });

  describe("isInternalRefreshBuyerTokensError", () => {
    it("returns true on known error", () => {
      const error = new Error("The swap has already reached its target");
      expect(isInternalRefreshBuyerTokensError(error)).toBeTruthy();
    });

    it("returns true on known error", () => {
      const error = new Error(
        "This is the beginning of the error. The swap has already reached its target ..."
      );
      expect(isInternalRefreshBuyerTokensError(error)).toBeTruthy();
    });

    it("returns false on unknown error", () => {
      const error = new Error("Fake the swap has already reached its target");
      expect(isInternalRefreshBuyerTokensError(error)).toBe(false);
    });

    it("returns false on not error argument", () => {
      expect(isInternalRefreshBuyerTokensError(null)).toBe(false);
      expect(isInternalRefreshBuyerTokensError(undefined)).toBe(false);
      expect(
        isInternalRefreshBuyerTokensError(
          "The swap has already reached its target"
        )
      ).toBe(false);
    });
  });

  describe("parseSnsSwapSaleBuyerCount", () => {
    const saleBuyerCount = 1_000_000;
    const RAW_METRICS = `
# TYPE sale_buyer_count gauge
sale_buyer_count ${saleBuyerCount} 1677707139456
# HELP sale_cf_participants_count`;

    it("returns sale_buyer_count value", () => {
      expect(parseSnsSwapSaleBuyerCount(RAW_METRICS)).toEqual(saleBuyerCount);
    });

    it("returns undefined when sale_buyer_count not found", () => {
      const WRONG_METRICS = `
# TYPE sale_buyer_count gauge
sale_participants_count ${saleBuyerCount} 1677707139456
# HELP sale_cf_participants_count`;
      expect(parseSnsSwapSaleBuyerCount(WRONG_METRICS)).toBeUndefined();
    });

    it("returns false on unknown error", () => {
      const error = new Error("Fake the swap has already reached its target");
      expect(isInternalRefreshBuyerTokensError(error)).toBe(false);
    });

    it("returns false on not error argument", () => {
      expect(isInternalRefreshBuyerTokensError(null)).toBe(false);
      expect(isInternalRefreshBuyerTokensError(undefined)).toBe(false);
      expect(
        isInternalRefreshBuyerTokensError(
          "The swap has already reached its target"
        )
      ).toBe(false);
    });
  });
});
