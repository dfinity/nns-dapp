import { clearSnsAggregatorCache } from "$lib/api-services/sns-aggregator.api-service";
import * as agent from "$lib/api/agent.api";
import * as proposalsApi from "$lib/api/proposals.api";
import * as aggregatorApi from "$lib/api/sns-aggregator.api";
import {
  clearWrapperCache,
  wrappers as getWrappers,
  wrapper,
} from "$lib/api/sns-wrapper.api";
import { snsFunctionsStore } from "$lib/derived/sns-functions.derived";
import { snsTotalTokenSupplyStore } from "$lib/derived/sns-total-token-supply.derived";
import {
  getLoadedSnsAggregatorData,
  loadProposalsSnsCF,
  loadSnsProjects,
} from "$lib/services/public/sns.services";
import {
  snsAggregatorIncludingAbortedProjectsStore,
  snsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  aggregatorMockSnsesDataDto,
  aggregatorSnsMockDto,
  aggregatorSnsMockWith,
} from "$tests/mocks/sns-aggregator.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { SnsSwapLifecycle } from "@icp-sdk/canisters/sns";
import { AnonymousIdentity, type HttpAgent } from "@icp-sdk/core/agent";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/sns.api");
vi.mock("$lib/api/sns-aggregator.api");
vi.mock("$lib/api/sns-governance.api");

const listSnsesSpy = vi.fn().mockResolvedValue(deployedSnsMock);
const initSnsWrapperSpy = vi.fn().mockResolvedValue(
  Promise.resolve({
    canisterIds: {
      rootCanisterId: rootCanisterIdMock,
      ledgerCanisterId: ledgerCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      swapCanisterId: swapCanisterIdMock,
    },
  })
);
vi.mock("$lib/proxy/api.import.proxy", () => {
  return {
    importSnsWasmCanister: vi.fn().mockImplementation(() => ({
      create: () => ({
        listSnses: listSnsesSpy,
      }),
    })),
    importInitSnsWrapper: vi.fn().mockImplementation(() => initSnsWrapperSpy),
  };
});

describe("SNS public services", () => {
  beforeEach(() => {
    clearSnsAggregatorCache();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("getLoadedSnsAggregatorData", () => {
    it("should return the aggregator store data", async () => {
      const data = [aggregatorSnsMockDto];
      snsAggregatorIncludingAbortedProjectsStore.setData(data);

      expect(await getLoadedSnsAggregatorData()).toEqual(data);
    });

    it("should work if the data is loaded after the call", async () => {
      let receivedData: CachedSnsDto[] | undefined;
      const promise = getLoadedSnsAggregatorData().then((data) => {
        receivedData = data;
      });

      expect(receivedData).toBeUndefined();

      const data = [aggregatorSnsMockDto];
      snsAggregatorIncludingAbortedProjectsStore.setData(data);

      await promise;

      expect(receivedData).toEqual(data);
    });
  });

  describe("loadSnsProjects", () => {
    beforeEach(() => {
      clearWrapperCache();
      resetIdentity();
    });

    it("loads sns stores with data", async () => {
      const spyQuerySnsProjects = vi
        .spyOn(aggregatorApi, "querySnsProjects")
        .mockImplementation(() =>
          Promise.resolve([aggregatorSnsMockDto, aggregatorSnsMockDto])
        );

      await loadSnsProjects();

      const rootCanisterId = aggregatorSnsMockDto.canister_ids.root_canister_id;
      expect(spyQuerySnsProjects).toBeCalled();

      const functionsStore = get(snsFunctionsStore);
      expect(functionsStore[rootCanisterId]).not.toBeUndefined();
    });

    it("SNS certified calls after aggregator store is filled don't trigger a call to list_sns_canisters", async () => {
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve([aggregatorSnsMockDto, aggregatorSnsMockDto])
      );

      await loadSnsProjects();

      await wrapper({
        identity: mockIdentity,
        rootCanisterId: aggregatorSnsMockDto.canister_ids.root_canister_id,
        certified: true,
      });

      expect(listSnsesSpy).not.toBeCalled();
    });

    it("SNS uncertified calls after aggregator store is filled don't trigger a call to list_sns_canisters", async () => {
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve([aggregatorSnsMockDto, aggregatorSnsMockDto])
      );

      await loadSnsProjects();

      await wrapper({
        identity: mockIdentity,
        rootCanisterId: aggregatorSnsMockDto.canister_ids.root_canister_id,
        certified: false,
      });

      expect(listSnsesSpy).not.toBeCalled();
    });

    it("should load sns aggregator store", async () => {
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve(aggregatorMockSnsesDataDto)
      );

      expect(get(snsAggregatorStore).data).toBeUndefined();

      await loadSnsProjects();

      expect(get(snsAggregatorIncludingAbortedProjectsStore).data).toEqual(
        aggregatorMockSnsesDataDto
      );
    });

    it("should load and map total token supply", async () => {
      const rootCanisterId = principal(0);
      const totalSupply = 2_000_000_000;
      const response = [
        {
          ...aggregatorSnsMockWith({
            rootCanisterId: rootCanisterId.toText(),
            lifecycle: undefined,
          }),
          icrc1_total_supply: totalSupply,
        },
        aggregatorSnsMockDto,
      ];
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve(response)
      );

      await loadSnsProjects();

      const supplies = get(snsTotalTokenSupplyStore);
      const data = supplies[rootCanisterId.toText()];
      expect(data).not.toBeUndefined();
      expect(data?.totalSupply).toEqual(BigInt(totalSupply));
    });

    it("should build and store wrappers, only for non-aborted SNSes", async () => {
      const committedSns1 = aggregatorSnsMockWith({
        rootCanisterId: principal(0).toText(),
        lifecycle: SnsSwapLifecycle.Committed,
      });
      const committedSns2 = aggregatorSnsMockWith({
        rootCanisterId: principal(1).toText(),
        lifecycle: SnsSwapLifecycle.Committed,
      });
      const abortedSns1 = aggregatorSnsMockWith({
        rootCanisterId: principal(2).toText(),
        lifecycle: SnsSwapLifecycle.Aborted,
      });
      const abortedSns2 = aggregatorSnsMockWith({
        rootCanisterId: principal(3).toText(),
        lifecycle: SnsSwapLifecycle.Aborted,
      });

      vi.spyOn(aggregatorApi, "querySnsProjects").mockResolvedValue([
        committedSns1,
        abortedSns1,
        committedSns2,
        abortedSns2,
      ]);

      await loadSnsProjects();

      const wrappers = await getWrappers({
        identity: mockIdentity,
        certified: true,
      });
      expect(wrappers).toHaveLength(2);
      expect(wrappers.has(committedSns1.canister_ids.root_canister_id)).toBe(
        true
      );
      expect(wrappers.has(committedSns2.canister_ids.root_canister_id)).toBe(
        true
      );
    });
  });

  describe("loadProposalsSnsCF", () => {
    let queryProposalsSpy;
    const baseRequestPayload = {
      beforeProposal: undefined,
      identity: new AnonymousIdentity(),
      includeStatus: [1],
      includeTopics: [14],
      certified: false,
    };

    beforeEach(() => {
      queryProposalsSpy = vi
        .spyOn(proposalsApi, "queryProposals")
        .mockResolvedValue([]);
    });

    it("should request proposals omitting large fields by default", async () => {
      await loadProposalsSnsCF();

      expect(queryProposalsSpy).toHaveBeenCalledTimes(1);
      expect(queryProposalsSpy).toHaveBeenCalledWith({
        omitLargeFields: true,
        ...baseRequestPayload,
      });
    });

    it("should request proposals not omitting large fields when requested", async () => {
      await loadProposalsSnsCF({
        omitLargeFields: false,
      });

      expect(queryProposalsSpy).toHaveBeenCalledTimes(1);
      expect(queryProposalsSpy).toHaveBeenCalledWith({
        omitLargeFields: false,
        ...baseRequestPayload,
      });
    });
  });
});
