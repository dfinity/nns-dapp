import { clearSnsAggregatorCache } from "$lib/api-services/sns-aggregator.api-service";
import * as agent from "$lib/api/agent.api";
import * as aggregatorApi from "$lib/api/sns-aggregator.api";
import { clearWrapperCache, wrapper } from "$lib/api/sns-wrapper.api";
import { snsFunctionsStore } from "$lib/derived/sns-functions.derived";
import { snsTotalTokenSupplyStore } from "$lib/derived/sns-total-token-supply.derived";
import { loadSnsProjects } from "$lib/services/public/sns.services";
import {
  snsAggregatorIncludingAbortedProjectsStore,
  snsAggregatorStore,
} from "$lib/stores/sns-aggregator.store";
import { tokensStore } from "$lib/stores/tokens.store";
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
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { nonNullish } from "@dfinity/utils";
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

const blockedPaths = [
  "$lib/api/sns-aggregator.api",
  "$lib/api/sns-governance.api",
  "$lib/api/sns.api",
];

describe("SNS public services", () => {
  blockAllCallsTo(blockedPaths);

  beforeEach(() => {
    tokensStore.reset();
    clearSnsAggregatorCache();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("loadSnsProjects", () => {
    beforeEach(() => {
      snsAggregatorIncludingAbortedProjectsStore.reset();
      clearWrapperCache();
      vi.clearAllMocks();
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

    it("SNS certified calls after aggregator store is filled don't trigger a call to list_sns_canisters", () => {
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve([aggregatorSnsMockDto, aggregatorSnsMockDto])
      );

      return new Promise<void>((done) => {
        snsAggregatorStore.subscribe(async ({ data }) => {
          // There is an initial call to subscribe with undefined data
          if (nonNullish(data)) {
            await wrapper({
              identity: mockIdentity,
              rootCanisterId:
                aggregatorSnsMockDto.canister_ids.root_canister_id,
              certified: true,
            });
            expect(listSnsesSpy).not.toBeCalled();
            done();
          }
        });

        loadSnsProjects();
      });
    });

    it("SNS uncertified calls after aggregator store is filled don't trigger a call to list_sns_canisters", () => {
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve([aggregatorSnsMockDto, aggregatorSnsMockDto])
      );

      return new Promise<void>((done) => {
        snsAggregatorStore.subscribe(async ({ data }) => {
          // There is an initial call to subscribe with undefined data
          if (nonNullish(data)) {
            await wrapper({
              identity: mockIdentity,
              rootCanisterId:
                aggregatorSnsMockDto.canister_ids.root_canister_id,
              certified: false,
            });
            expect(listSnsesSpy).not.toBeCalled();
            done();
          }
        });

        loadSnsProjects();
      });
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
  });
});
