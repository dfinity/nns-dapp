import { ProposalStatus } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
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
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

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

  describe("query store", () => {
    beforeAll(() => snsQueryStore.reset());

    afterEach(() => snsQueryStore.reset());

    it("should set the data", () => {
      const data = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Open],
        certified: true,
      });

      snsQueryStore.setData(data);

      const store = get(snsQueryStore);
      expect(store?.metadata).toEqual(data[0]);
      expect(store?.swaps).toEqual(data[1]);
    });

    it("should reset the store", () => {
      const data = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Open],
        certified: true,
      });

      snsQueryStore.setData(data);
      snsQueryStore.reset();

      const store = get(snsQueryStore);
      expect(store).toBeUndefined();
    });

    it("should set the store as loading state", () => {
      const data = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Open],
        certified: true,
      });

      snsQueryStore.setData(data);
      snsQueryStore.setLoadingState();

      const store = get(snsQueryStore);
      expect(store).toBeNull();
    });

    it("should update the data", () => {
      const data = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Pending],
        certified: true,
      });

      snsQueryStore.setData(data);

      const [summaries, swaps] = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Committed],
        certified: true,
      });

      const rootCanisterId = summaries[0].rootCanisterId;

      snsQueryStore.updateData({
        data: [summaries[0], swaps[0]],
        rootCanisterId: rootCanisterId,
      });

      const updatedStore = get(snsQueryStore);
      expect(
        updatedStore?.metadata.find(
          (summary) =>
            summary.rootCanisterId === rootCanisterId
        )
      ).toEqual(summaries[0]);

      expect(
        updatedStore?.swaps.find(
          (swap) => swap.rootCanisterId === rootCanisterId
        )
      ).toEqual(swaps[0]);
    });
  });

  it("should filter the data", () => {
    const data = snsResponsesForLifecycle({
      lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Pending],
      certified: true,
    });

    snsQueryStore.setData(data);

    const rootCanisterId = data[0][0].rootCanisterId;

    snsQueryStore.updateData({
      data: [undefined, undefined],
      rootCanisterId: rootCanisterId,
    });

    const updatedStore = get(snsQueryStore);
    expect(
      updatedStore?.metadata.find(
        (summary) => summary.rootCanisterId === rootCanisterId
      )
    ).toBeUndefined();

    expect(
      updatedStore?.swaps.find(
        (swap) => swap.rootCanisterId === rootCanisterId
      )
    ).toBeUndefined();
  });
});
