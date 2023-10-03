import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { snsDerivedStateStore } from "$lib/stores/sns-derived-state.store";
import { snsLifecycleStore } from "$lib/stores/sns-lifecycle.store";
import {
  isLoadingSnsProjectsStore,
  openSnsProposalsStore,
  snsProposalsStore,
  snsProposalsStoreIsLoading,
  snsQueryStore,
  snsSummariesStore,
  snsSwapCommitmentsStore,
  type SnsQueryStoreData,
} from "$lib/stores/sns.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import type { QuerySnsMetadata, QuerySnsSwapState } from "$lib/types/sns.query";
import {
  convertDtoData,
  convertDtoToSnsSummary,
} from "$lib/utils/sns-aggregator-converters.utils";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import {
  aggregatorSnsMockDto,
  aggregatorSnsMockWith,
} from "$tests/mocks/sns-aggregator.mock";
import {
  mockDerivedResponse,
  mockLifecycleResponse,
  mockSnsSummaryList,
  mockSnsSwapCommitment,
} from "$tests/mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ProposalStatus } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsSwapLifecycle,
  type SnsGetDerivedStateResponse,
  type SnsGetLifecycleResponse,
  type SnsSwap,
  type SnsSwapDerivedState,
} from "@dfinity/sns";
import { fromNullable, toNullable } from "@dfinity/utils";
import { get } from "svelte/store";

describe("sns.store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    snsQueryStore.reset();
    snsAggregatorStore.reset();
    snsDerivedStateStore.reset();
    snsLifecycleStore.reset();
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

  describe("sns proposals", () => {
    it("should store proposals", () => {
      const proposals = [{ ...mockProposalInfo }];
      snsProposalsStore.setProposals({
        proposals,
        certified: false,
      });

      const $snsProposalsStore = get(snsProposalsStore);

      expect($snsProposalsStore?.proposals).toEqual(proposals);
      expect($snsProposalsStore?.certified).toBe(false);
    });

    it("should filter open proposals", () => {
      const nowSeconds = new Date().getTime() / 1000;
      const proposals = [
        {
          ...mockProposalInfo,
          id: BigInt(111),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds + 10000)),
          status: ProposalStatus.Rejected,
        },
        {
          ...mockProposalInfo,
          id: BigInt(222),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds - 10000)),
          status: ProposalStatus.Open,
        },
        {
          ...mockProposalInfo,
          id: BigInt(222),
          deadlineTimestampSeconds: BigInt(Math.round(nowSeconds + 10000)),
          status: ProposalStatus.Accepted,
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

    it("should set the store as loading state", () => {
      const proposals = {
        proposals: [{ ...mockProposalInfo }],
        certified: false,
      };
      snsProposalsStore.setProposals(proposals);

      expect(get(snsProposalsStoreIsLoading)).toBe(false);

      snsProposalsStore.reset();
      expect(get(snsProposalsStoreIsLoading)).toBe(true);
    });
  });

  describe("query store", () => {
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
          (summary) => summary.rootCanisterId === rootCanisterId
        )
      ).toEqual(summaries[0]);

      expect(
        updatedStore?.swaps.find(
          (swap) => swap.rootCanisterId === rootCanisterId
        )
      ).toEqual(swaps[0]);
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

  describe("isLoadingSnsProjectsStore", () => {
    describe("with ENABLE_SNS_AGGREGATOR_STORE false", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_SNS_AGGREGATOR_STORE", false);
      });

      it("should not be loading if snsQueryStore is set but not snsAggregatorStore", () => {
        snsQueryStore.reset();
        snsAggregatorStore.setData([aggregatorSnsMockDto]);
        expect(get(isLoadingSnsProjectsStore)).toBe(true);

        const data = snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open],
          certified: true,
        });

        snsQueryStore.setData(data);
        expect(get(isLoadingSnsProjectsStore)).toBe(false);
      });
    });

    describe("with ENABLE_SNS_AGGREGATOR_STORE true", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_SNS_AGGREGATOR_STORE", true);
      });

      it("should not be loading if sns aggregator store is set but not snsQueryStore", () => {
        const data = snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open],
          certified: true,
        });

        snsQueryStore.setData(data);
        snsAggregatorStore.reset();
        expect(get(isLoadingSnsProjectsStore)).toBe(true);

        snsAggregatorStore.setData([aggregatorSnsMockDto]);
        expect(get(isLoadingSnsProjectsStore)).toBe(false);
      });
    });
  });

  describe("updateSwapState", () => {
    it("should update the swap state", () => {
      const [metadatas, swapDatas] = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Pending, SnsSwapLifecycle.Pending],
        certified: true,
      });

      snsQueryStore.setData([metadatas, swapDatas]);

      const rootCanisterId = metadatas[0].rootCanisterId;

      const updatedSwapData: QuerySnsSwapState = {
        ...swapDatas[0],
        swap: [
          {
            ...swapDatas[0].swap[0],
            lifecycle: SnsSwapLifecycle.Open,
          },
        ],
      };

      const initStore = get(snsQueryStore);
      expect(
        initStore?.swaps.find((swap) => swap.rootCanisterId === rootCanisterId)
          ?.swap[0]?.lifecycle
      ).toBe(SnsSwapLifecycle.Pending);

      snsQueryStore.updateSwapState({
        swapData: updatedSwapData,
        rootCanisterId: rootCanisterId,
      });

      const updatedStore = get(snsQueryStore);
      expect(
        updatedStore?.swaps.find(
          (swap) => swap.rootCanisterId === rootCanisterId
        )
      ).toEqual(updatedSwapData);
    });
  });

  describe("updateDerivedState", () => {
    const derivedState = ({
      rootCanisterId,
      store,
    }: {
      rootCanisterId: string;
      store: SnsQueryStoreData | undefined;
    }): SnsSwapDerivedState | undefined =>
      store?.swaps.find((swap) => swap.rootCanisterId === rootCanisterId)
        ?.derived[0];

    it("should update the derived state", () => {
      const [metadatas, swapDatas] = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Pending, SnsSwapLifecycle.Pending],
        certified: true,
      });

      snsQueryStore.setData([metadatas, swapDatas]);

      const rootCanisterId = metadatas[0].rootCanisterId;

      const updatedBuyerTotalIcps = BigInt(1000_000_000);
      const updatedSnsTokensPerIcp = 10_000;
      const updatedDerivedState: SnsGetDerivedStateResponse = {
        sns_tokens_per_icp: [updatedSnsTokensPerIcp],
        buyer_total_icp_e8s: [updatedBuyerTotalIcps],
        cf_participant_count: [10n],
        direct_participant_count: [100n],
        cf_neuron_count: [11n],
        direct_participation_icp_e8s: [],
        neurons_fund_participation_icp_e8s: [],
      };

      const initStore = get(snsQueryStore);
      const initState = derivedState({ rootCanisterId, store: initStore });
      expect(initState?.buyer_total_icp_e8s).not.toBe(updatedBuyerTotalIcps);
      expect(initState?.sns_tokens_per_icp).not.toBe(updatedSnsTokensPerIcp);

      snsQueryStore.updateDerivedState({
        derivedState: updatedDerivedState,
        rootCanisterId: rootCanisterId,
      });

      const updatedStore = get(snsQueryStore);
      const updatedState = derivedState({
        rootCanisterId,
        store: updatedStore,
      });
      expect(updatedState?.buyer_total_icp_e8s).toEqual(updatedBuyerTotalIcps);
      expect(updatedState?.sns_tokens_per_icp).toEqual(updatedSnsTokensPerIcp);
      expect(updatedState?.cf_neuron_count).toEqual(
        updatedDerivedState.cf_neuron_count
      );
      expect(updatedState?.direct_participant_count).toEqual(
        updatedDerivedState.direct_participant_count
      );
      expect(updatedState?.cf_participant_count).toEqual(
        updatedDerivedState.cf_participant_count
      );
    });

    it("should NOT update the derived state if sns_tokens_per_icp undefined", () => {
      const [metadatas, swapDatas] = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Pending, SnsSwapLifecycle.Pending],
        certified: true,
      });

      snsQueryStore.setData([metadatas, swapDatas]);

      const rootCanisterId = metadatas[0].rootCanisterId;

      const updatedBuyerTotalIcps = BigInt(1000_000_000);
      const updatedDerivedState: SnsGetDerivedStateResponse = {
        sns_tokens_per_icp: [],
        buyer_total_icp_e8s: [updatedBuyerTotalIcps],
        cf_participant_count: [],
        direct_participant_count: [],
        cf_neuron_count: [],
        direct_participation_icp_e8s: [],
        neurons_fund_participation_icp_e8s: [],
      };

      const initStore = get(snsQueryStore);
      const initState = derivedState({ rootCanisterId, store: initStore });
      const initValueBuyers = initState?.buyer_total_icp_e8s;
      const initValueTokens = initState?.sns_tokens_per_icp;

      snsQueryStore.updateDerivedState({
        derivedState: updatedDerivedState,
        rootCanisterId: rootCanisterId,
      });

      const updatedStore = get(snsQueryStore);
      const updatedState = derivedState({
        rootCanisterId,
        store: updatedStore,
      });
      expect(updatedState?.buyer_total_icp_e8s).toEqual(initValueBuyers);
      expect(updatedState?.sns_tokens_per_icp).toEqual(initValueTokens);
    });

    it("should NOT update the derived state if buyer_total_icp_e8s undefined", () => {
      const [metadatas, swapDatas] = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Pending, SnsSwapLifecycle.Pending],
        certified: true,
      });

      snsQueryStore.setData([metadatas, swapDatas]);

      const rootCanisterId = metadatas[0].rootCanisterId;

      const updatedSnsTokensPerIcp = 10_000;
      const updatedDerivedState: SnsGetDerivedStateResponse = {
        sns_tokens_per_icp: [updatedSnsTokensPerIcp],
        buyer_total_icp_e8s: [],
        cf_participant_count: [],
        direct_participant_count: [],
        cf_neuron_count: [],
        direct_participation_icp_e8s: [],
        neurons_fund_participation_icp_e8s: [],
      };

      const initStore = get(snsQueryStore);
      const initState = derivedState({ rootCanisterId, store: initStore });
      const initValueBuyers = initState?.buyer_total_icp_e8s;
      const initValueTokens = initState?.sns_tokens_per_icp;

      snsQueryStore.updateDerivedState({
        derivedState: updatedDerivedState,
        rootCanisterId: rootCanisterId,
      });

      const updatedStore = get(snsQueryStore);
      const updatedState = derivedState({
        rootCanisterId,
        store: updatedStore,
      });
      expect(updatedState?.buyer_total_icp_e8s).toEqual(initValueBuyers);
      expect(updatedState?.sns_tokens_per_icp).toEqual(initValueTokens);
    });
  });

  describe("updateLifecycle", () => {
    const swapState = ({
      rootCanisterId,
      store,
    }: {
      rootCanisterId: string;
      store: SnsQueryStoreData | undefined;
    }): SnsSwap | undefined =>
      store?.swaps.find((swap) => swap.rootCanisterId === rootCanisterId)
        ?.swap[0];
    const lifecycle = ({
      rootCanisterId,
      store,
    }: {
      rootCanisterId: string;
      store: SnsQueryStoreData | undefined;
    }): SnsSwapLifecycle | undefined =>
      swapState({ rootCanisterId, store }).lifecycle;

    it("should update the lifecycle", () => {
      const [metadatas, swapDatas] = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Pending, SnsSwapLifecycle.Pending],
        certified: true,
      });

      snsQueryStore.setData([metadatas, swapDatas]);

      const rootCanisterId = metadatas[0].rootCanisterId;
      const initLifecycle = swapDatas[0].swap[0].lifecycle;

      const initStore = get(snsQueryStore);
      const initState = lifecycle({ rootCanisterId, store: initStore });
      expect(initState).toBe(initLifecycle);

      const newLifecycle = SnsSwapLifecycle.Open;
      snsQueryStore.updateLifecycle({
        lifecycle: newLifecycle,
        rootCanisterId: rootCanisterId,
      });

      const updatedStore = get(snsQueryStore);
      expect(lifecycle({ rootCanisterId, store: updatedStore })).toEqual(
        newLifecycle
      );
    });

    it("should not change the rest of the state", () => {
      const [metadatas, swapDatas] = snsResponsesForLifecycle({
        lifecycles: [SnsSwapLifecycle.Pending, SnsSwapLifecycle.Pending],
        certified: true,
      });

      snsQueryStore.setData([metadatas, swapDatas]);

      const rootCanisterId = metadatas[0].rootCanisterId;
      const initState = swapDatas[0].swap[0];

      const initStore = get(snsQueryStore);
      const initStateInStore = swapState({ rootCanisterId, store: initStore });
      expect(initStateInStore).toBe(initState);

      const newLifecycle = SnsSwapLifecycle.Open;
      snsQueryStore.updateLifecycle({
        lifecycle: newLifecycle,
        rootCanisterId: rootCanisterId,
      });

      const expectedState = {
        ...initState,
        lifecycle: newLifecycle,
      };
      const updatedStore = get(snsQueryStore);
      const stateInStore = swapState({ rootCanisterId, store: updatedStore });
      expect(stateInStore).toEqual(expectedState);
    });
  });

  describe("snsSummariesStore", () => {
    describe("flag ENABLE_SNS_AGGREGATOR_STORE not enabled", () => {
      beforeEach(() => {
        jest.spyOn(console, "warn").mockImplementation(() => undefined);
        overrideFeatureFlagsStore.setFlag("ENABLE_SNS_AGGREGATOR_STORE", false);
      });

      it("uses snsQueryStore as source of data", () => {
        snsAggregatorStore.reset();
        const data = snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open],
          certified: true,
        });
        snsQueryStore.setData(data);

        expect(get(snsSummariesStore)).toHaveLength(1);
      });

      it("does NOT use snsAggregator as source of data", () => {
        snsAggregatorStore.setData([aggregatorSnsMockDto]);
        snsQueryStore.reset();

        expect(get(snsSummariesStore)).toHaveLength(0);
      });
    });

    describe("flag ENABLE_SNS_AGGREGATOR_STORE is enabled", () => {
      const rootCanisterId = rootCanisterIdMock;

      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_SNS_AGGREGATOR_STORE", true);
      });

      it("warns when snsAggregatorStore and snsQueryStore have different number of summaries", () => {
        expect(console.warn).not.toHaveBeenCalled();
        snsAggregatorStore.setData([aggregatorSnsMockDto]);
        const data = snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Open],
          certified: true,
        });
        snsQueryStore.setData(data);

        get(snsSummariesStore);
        expect(console.warn).toHaveBeenCalledTimes(1);
        expect(console.warn).toHaveBeenCalledWith(
          "The aggregator and query data do not match. Aggregator data: 1, query data: 2."
        );
      });

      it("warns when snsAggregatorStore and snsQueryStore return different summary data for the same SNS project", () => {
        expect(console.warn).not.toHaveBeenCalled();
        snsAggregatorStore.setData([aggregatorSnsMockDto]);
        const cachedSnses = convertDtoData([aggregatorSnsMockDto]);
        const snsQueryStoreData: [QuerySnsMetadata[], QuerySnsSwapState[]] = [
          cachedSnses.map((sns) => ({
            rootCanisterId: sns.canister_ids.root_canister_id,
            certified: true,
            metadata: sns.meta,
            token: sns.icrc1_metadata,
          })),
          cachedSnses.map((sns) => ({
            rootCanisterId: sns.canister_ids.root_canister_id,
            certified: true,
            swapCanisterId: Principal.fromText(
              sns.canister_ids.swap_canister_id
            ),
            governanceCanisterId: Principal.fromText(
              sns.canister_ids.governance_canister_id
            ),
            ledgerCanisterId: Principal.fromText(
              sns.canister_ids.ledger_canister_id
            ),
            indexCanisterId: Principal.fromText(
              sns.canister_ids.index_canister_id
            ),
            swap: toNullable(sns.swap_state.swap),
            derived: toNullable({
              // THIS IS DIFFERENT
              sns_tokens_per_icp: 0,
              buyer_total_icp_e8s:
                fromNullable(sns.derived_state.buyer_total_icp_e8s) ?? 0n,
              cf_participant_count: sns.derived_state.cf_participant_count,
              direct_participant_count:
                sns.derived_state.direct_participant_count,
              cf_neuron_count: sns.derived_state.cf_neuron_count,
              direct_participation_icp_e8s: [],
              neurons_fund_participation_icp_e8s: [],
            }),
          })),
        ];
        snsQueryStore.setData(snsQueryStoreData);

        const expectedSummary = convertDtoToSnsSummary(aggregatorSnsMockDto);

        get(snsSummariesStore);
        expect(console.warn).toHaveBeenCalledTimes(2);
        expect(console.warn).toHaveBeenCalledWith(
          "The aggregator and query data do not match. Check below and the debug store for more information."
        );
        expect(console.warn).toHaveBeenCalledWith([expectedSummary]);
      });

      it("doesn't warn anything if snsQueryStore and snsAggregator return the same summary", () => {
        snsAggregatorStore.setData([aggregatorSnsMockDto]);
        const cachedSnses = convertDtoData([aggregatorSnsMockDto]);
        const snsQueryStoreData: [QuerySnsMetadata[], QuerySnsSwapState[]] = [
          cachedSnses.map((sns) => ({
            rootCanisterId: sns.canister_ids.root_canister_id,
            certified: true,
            metadata: sns.meta,
            token: sns.icrc1_metadata,
          })),
          cachedSnses.map((sns) => ({
            rootCanisterId: sns.canister_ids.root_canister_id,
            certified: true,
            swapCanisterId: Principal.fromText(
              sns.canister_ids.swap_canister_id
            ),
            governanceCanisterId: Principal.fromText(
              sns.canister_ids.governance_canister_id
            ),
            ledgerCanisterId: Principal.fromText(
              sns.canister_ids.ledger_canister_id
            ),
            indexCanisterId: Principal.fromText(
              sns.canister_ids.index_canister_id
            ),
            swap: toNullable(sns.swap_state.swap),
            derived: toNullable({
              sns_tokens_per_icp:
                fromNullable(sns.derived_state.sns_tokens_per_icp) ?? 0,
              buyer_total_icp_e8s:
                fromNullable(sns.derived_state.buyer_total_icp_e8s) ?? 0n,
              cf_participant_count: sns.derived_state.cf_participant_count,
              direct_participant_count:
                sns.derived_state.direct_participant_count,
              cf_neuron_count: sns.derived_state.cf_neuron_count,
              direct_participation_icp_e8s:
                sns.derived_state.direct_participation_icp_e8s,
              neurons_fund_participation_icp_e8s:
                sns.derived_state.direct_participation_icp_e8s,
            }),
          })),
        ];
        snsQueryStore.setData(snsQueryStoreData);

        get(snsSummariesStore);
        expect(console.warn).not.toHaveBeenCalled();
      });

      it("does not snsQueryStore as source of data", () => {
        snsAggregatorStore.reset();
        const data = snsResponsesForLifecycle({
          lifecycles: [SnsSwapLifecycle.Open],
          certified: true,
        });
        snsQueryStore.setData(data);

        expect(get(snsSummariesStore)).toHaveLength(0);
      });

      it("uses snsAggregator as source of data", () => {
        snsAggregatorStore.setData([aggregatorSnsMockDto]);
        snsQueryStore.reset();

        expect(get(snsSummariesStore)).toHaveLength(1);
      });

      it("derived state is overriden with data in snsDerivedStateStore", () => {
        const newSnsTokensPerIcp = 4;
        const aggregatorData = aggregatorSnsMockWith({
          rootCanisterId: rootCanisterId.toText(),
        });
        snsAggregatorStore.setData([aggregatorData]);
        snsQueryStore.reset();

        expect(get(snsSummariesStore)[0].derived.sns_tokens_per_icp).not.toBe(
          newSnsTokensPerIcp
        );

        const newDerivedState: SnsGetDerivedStateResponse = {
          ...mockDerivedResponse,
          sns_tokens_per_icp: [newSnsTokensPerIcp],
        };
        snsDerivedStateStore.setDerivedState({
          certified: true,
          rootCanisterId,
          data: newDerivedState,
        });

        expect(get(snsSummariesStore)[0].derived.sns_tokens_per_icp).toBe(
          newSnsTokensPerIcp
        );
      });

      it("lifestate is overriden with data in snsDerivedStateStore", () => {
        const newLifecycle = SnsSwapLifecycle.Open;
        const aggregatorData = aggregatorSnsMockWith({
          rootCanisterId: rootCanisterId.toText(),
        });
        snsAggregatorStore.setData([aggregatorData]);
        snsQueryStore.reset();

        expect(get(snsSummariesStore)[0].swap.lifecycle).not.toBe(newLifecycle);

        const newLifecycleResponse: SnsGetLifecycleResponse = {
          ...mockLifecycleResponse,
          lifecycle: [newLifecycle],
        };
        snsLifecycleStore.setData({
          certified: true,
          rootCanisterId,
          data: newLifecycleResponse,
        });

        expect(get(snsSummariesStore)[0].swap.lifecycle).toBe(newLifecycle);
      });
    });
  });
});
