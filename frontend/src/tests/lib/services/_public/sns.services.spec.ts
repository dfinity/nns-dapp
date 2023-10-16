import * as agent from "$lib/api/agent.api";
import * as aggregatorApi from "$lib/api/sns-aggregator.api";
import * as governanceApi from "$lib/api/sns-governance.api";
import {
  loadSnsNervousSystemFunctions,
  loadSnsProjects,
} from "$lib/services/$public/sns.services";
import { authStore } from "$lib/stores/auth.store";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import {
  aggregatorMockSnsesDataDto,
  aggregatorSnsMockDto,
  aggregatorSnsMockWith,
  aggregatorTokenMock,
} from "$tests/mocks/sns-aggregator.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/sns.api");
vi.mock("$lib/api/sns-aggregator.api");
vi.mock("$lib/api/sns-governance.api");
vi.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: vi.fn(),
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
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  describe("loadSnsNervousSystemFunctions", () => {
    beforeEach(() => {
      snsFunctionsStore.reset();
      vi.clearAllMocks();
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
    });
    it("should call sns api getNervousSystemFunctions and load the nervous system functions store", async () => {
      const spyGetFunctions = vi
        .spyOn(governanceApi, "getNervousSystemFunctions")
        .mockImplementation(() => Promise.resolve([nervousSystemFunctionMock]));

      await loadSnsNervousSystemFunctions(mockPrincipal);

      const store = get(snsFunctionsStore);
      await waitFor(() =>
        expect(store[mockPrincipal.toText()]?.nsFunctions).toEqual([
          nervousSystemFunctionMock,
        ])
      );
      expect(spyGetFunctions).toBeCalled();
    });

    it("should not call api if nervous functions are in the snsFunctionsStore store and certified", async () => {
      snsFunctionsStore.setProjectFunctions({
        rootCanisterId: mockPrincipal,
        nsFunctions: [nervousSystemFunctionMock],
        certified: true,
      });
      const spyGetFunctions = vi
        .spyOn(governanceApi, "getNervousSystemFunctions")
        .mockImplementation(() => Promise.resolve([nervousSystemFunctionMock]));

      await loadSnsNervousSystemFunctions(mockPrincipal);

      expect(spyGetFunctions).not.toBeCalled();
    });

    it("should not call api if nervous functions are in the snsAggregator store", async () => {
      const rootCanisterId = rootCanisterIdMock;
      const aggregatorProject = aggregatorSnsMockWith({
        rootCanisterId: rootCanisterId.toText(),
      });
      snsAggregatorStore.setData([aggregatorProject]);
      const spyGetFunctions = vi.spyOn(
        governanceApi,
        "getNervousSystemFunctions"
      );

      await loadSnsNervousSystemFunctions(rootCanisterId);

      expect(spyGetFunctions).not.toBeCalled();
    });

    it("should show a toast if api throws an error", async () => {
      vi.spyOn(governanceApi, "getNervousSystemFunctions").mockImplementation(
        () => Promise.reject("error")
      );

      await loadSnsNervousSystemFunctions(mockPrincipal);

      await waitFor(() => expect(toastsError).toBeCalled());
    });
  });

  describe("loadSnsProjects", () => {
    beforeEach(() => {
      snsFunctionsStore.reset();
      transactionsFeesStore.reset();
      snsAggregatorStore.reset();
      vi.clearAllMocks();
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
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
      const feesStore = get(transactionsFeesStore);
      expect(feesStore.projects[rootCanisterId]).not.toBeUndefined();
    });

    it("should load sns aggregator store", async () => {
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve(aggregatorMockSnsesDataDto)
      );

      expect(get(snsAggregatorStore).data).toBeUndefined();

      await loadSnsProjects();

      expect(get(snsAggregatorStore).data).toEqual(aggregatorMockSnsesDataDto);
    });

    it("should load and map tokens", async () => {
      vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(() =>
        Promise.resolve([aggregatorSnsMockDto, aggregatorSnsMockDto])
      );

      await loadSnsProjects();

      const rootCanisterId = aggregatorSnsMockDto.canister_ids.root_canister_id;

      const tokens = get(tokensStore);
      const token = tokens[rootCanisterId];
      expect(token).not.toBeUndefined();
      expect(token?.certified).toBeTruthy();
      expect(token?.token).toEqual(aggregatorTokenMock);
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
      expect(data?.certified).toBeTruthy();
      expect(data?.totalSupply).toEqual(BigInt(totalSupply));
    });
  });
});
