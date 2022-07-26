import { ProposalStatus } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";
import { OWN_CANISTER_ID } from "../../../lib/constants/canister-ids.constants";
import {
  activePadProjectsStore,
  committedProjectsStore,
  isNnsProjectStore,
  openSnsProposalsStore,
  snsProjectSelectedStore,
  snsProposalsStore,
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "../../../lib/stores/projects.store";
import type { SnsSwapCommitment } from "../../../lib/types/sns";
import { mockProposalInfo } from "../../mocks/proposal.mock";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
  summaryForLifecycle,
} from "../../mocks/sns-projects.mock";

describe("projects.store", () => {
  describe("snsSummariesStore", () => {
    it("should store summaries", () => {
      snsSummariesStore.setSummaries({
        summaries: mockSnsSummaryList,
        certified: false,
      });

      const $snsSummariesStore = get(snsSummariesStore);

      expect($snsSummariesStore?.summaries).toEqual(mockSnsSummaryList);
      expect($snsSummariesStore?.certified).toBeFalsy();
    });
  });

  describe("snsSwapStatesStore", () => {
    it("should store swap states", () => {
      const swapCommitment = mockSnsSwapCommitment(
        mockSnsSummaryList[0].rootCanisterId
      ) as SnsSwapCommitment;
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment,
        certified: true,
      });

      const $snsSwapStatesStore = get(snsSwapCommitmentsStore);

      expect($snsSwapStatesStore?.[0].swapCommitment).toEqual(swapCommitment);
      expect($snsSwapStatesStore?.[0].certified).toBeTruthy();
    });
  });

  describe("filter projects store", () => {
    beforeAll(() => {
      snsSummariesStore.reset();
    });

    afterAll(() => {
      snsSummariesStore.reset();
    });

    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: true,
    });

    it("should filter projects that are active", () => {
      snsSummariesStore.setSummaries({
        summaries: [summaryForLifecycle(SnsSwapLifecycle.Open)],
        certified: false,
      });
      const open = get(activePadProjectsStore);
      expect(open?.length).toEqual(1);

      snsSummariesStore.setSummaries({
        summaries: [
          summaryForLifecycle(SnsSwapLifecycle.Open),
          summaryForLifecycle(SnsSwapLifecycle.Committed),
        ],
        certified: false,
      });
      const open2 = get(activePadProjectsStore);
      expect(open2?.length).toEqual(2);

      snsSummariesStore.setSummaries({
        summaries: [summaryForLifecycle(SnsSwapLifecycle.Unspecified)],
        certified: false,
      });
      const noOpen = get(activePadProjectsStore);
      expect(noOpen?.length).toEqual(0);
    });

    it("should filter projects that are committed only", () => {
      snsSummariesStore.setSummaries({
        summaries: [summaryForLifecycle(SnsSwapLifecycle.Committed)],
        certified: false,
      });

      const committed = get(committedProjectsStore);
      expect(committed?.length).toEqual(1);

      snsSummariesStore.setSummaries({
        summaries: [summaryForLifecycle(SnsSwapLifecycle.Open)],
        certified: false,
      });
      const noCommitted = get(committedProjectsStore);
      expect(noCommitted?.length).toEqual(0);
    });
  });

  describe("sns proposals", () => {
    it("should store proposals", () => {
      const proposals = [{ ...mockProposalInfo }];
      snsProposalsStore.setProposals({
        proposals,
        certified: false,
      });

      const $snsProposalsStore = get(snsProposalsStore);

      expect($snsProposalsStore?.proposals).toEqual(proposals);
      expect($snsProposalsStore?.certified).toBeFalsy();
    });

    it("should filter open proposals", () => {
      const nowSeconds = new Date().getTime() / 1000;
      const proposals = [
        {
          ...mockProposalInfo,
          id: BigInt(111),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds + 10000)),
          status: ProposalStatus.PROPOSAL_STATUS_REJECTED,
        },
        {
          ...mockProposalInfo,
          id: BigInt(222),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds - 10000)),
          status: ProposalStatus.PROPOSAL_STATUS_OPEN,
        },
        {
          ...mockProposalInfo,
          id: BigInt(222),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds + 10000)),
          status: ProposalStatus.PROPOSAL_STATUS_ACCEPTED,
        },
      ];

      snsProposalsStore.setProposals({
        proposals,
        certified: false,
      });

      const $openSnsProposalsStore = get(openSnsProposalsStore);

      expect($openSnsProposalsStore.length).toBe(1);
      expect($openSnsProposalsStore[0]).toEqual(proposals[1]);
    });
  });

  describe("snsProjectSelectedStore", () => {
    beforeEach(() => {
      snsProjectSelectedStore.set(OWN_CANISTER_ID);
    });

    it("should be set by default to own canister id", () => {
      const $store = get(snsProjectSelectedStore);

      expect($store).toEqual(OWN_CANISTER_ID);
    });

    it("should able to set it to another project id", () => {
      const $store1 = get(snsProjectSelectedStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      const newPrincipal = Principal.fromText("aaaaa-aa");
      snsProjectSelectedStore.set(newPrincipal);

      const $store2 = get(snsProjectSelectedStore);
      expect($store2).toEqual(newPrincipal);
    });
  });

  describe("isNnsProjectStore", () => {
    beforeEach(() => {
      snsProjectSelectedStore.set(OWN_CANISTER_ID);
    });

    it("should be set by default true", () => {
      const $store = get(isNnsProjectStore);

      expect($store).toEqual(true);
    });

    it("should be false if an sns project is selected", () => {
      snsProjectSelectedStore.set(Principal.fromText("aaaaa-aa"));
      const $store = get(isNnsProjectStore);

      expect($store).toBe(false);
    });
  });
});
