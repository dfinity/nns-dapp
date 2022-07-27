import { ProposalStatus } from "@dfinity/nns";
import { get } from "svelte/store";
import {
  openSnsProposalsStore,
  snsProposalsStore,
  snsQueryStore,
  snsSwapCommitmentsStore,
} from "../../../lib/stores/sns.store";
import type { SnsSwapCommitment } from "../../../lib/types/sns";
import { mockProposalInfo } from "../../mocks/proposal.mock";
import {
  mockSnsSummaryList,
  mockSnsSwapCommitment,
} from "../../mocks/sns-projects.mock";

describe("sns.store", () => {
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
      snsQueryStore.reset();
    });

    afterAll(() => {
      snsQueryStore.reset();
    });

    const principal = mockSnsSummaryList[0].rootCanisterId;

    snsSwapCommitmentsStore.setSwapCommitment({
      swapCommitment: mockSnsSwapCommitment(principal),
      certified: true,
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
  });
});
