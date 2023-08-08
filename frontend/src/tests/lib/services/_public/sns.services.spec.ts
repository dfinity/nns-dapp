/**
 * @jest-environment jsdom
 */

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
import { snsQueryStore } from "$lib/stores/sns.store";
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
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

jest.mock("$lib/api/sns.api");
jest.mock("$lib/api/sns-aggregator.api");
jest.mock("$lib/api/sns-governance.api");
jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: jest.fn(),
  };
});

const blockedPaths = [
  "$lib/api/sns-aggregator.api",
  "$lib/api/sns-governance.api",
  "$lib/api/sns.api",
];

describe("SNS public services", () => {
  blockAllCallsTo(blockedPaths);

  describe("loadSnsNervousSystemFunctions", () => {
    beforeEach(() => {
      snsFunctionsStore.reset();
      jest.clearAllMocks();
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });
    it("should call sns api getNervousSystemFunctions and load the nervous system functions store", async () => {
      const spyGetFunctions = jest
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

    it("should not call api if nervous functions are in the store and certified", async () => {
      snsFunctionsStore.setProjectFunctions({
        rootCanisterId: mockPrincipal,
        nsFunctions: [nervousSystemFunctionMock],
        certified: true,
      });
      const spyGetFunctions = jest
        .spyOn(governanceApi, "getNervousSystemFunctions")
        .mockImplementation(() => Promise.resolve([nervousSystemFunctionMock]));

      await loadSnsNervousSystemFunctions(mockPrincipal);

      expect(spyGetFunctions).not.toBeCalled();
    });

    it("should show a toast if api throws an error", async () => {
      jest
        .spyOn(governanceApi, "getNervousSystemFunctions")
        .mockImplementation(() => Promise.reject("error"));

      await loadSnsNervousSystemFunctions(mockPrincipal);

      await waitFor(() => expect(toastsError).toBeCalled());
    });
  });

  describe("loadSnsProjects", () => {
    beforeEach(() => {
      snsQueryStore.reset();
      snsFunctionsStore.reset();
      transactionsFeesStore.reset();
      snsAggregatorStore.reset();
      jest.clearAllMocks();
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });

    it("loads sns stores with data", async () => {
      const spyQuerySnsProjects = jest
        .spyOn(aggregatorApi, "querySnsProjects")
        .mockImplementation(() =>
          Promise.resolve([aggregatorSnsMockDto, aggregatorSnsMockDto])
        );

      await loadSnsProjects();

      const rootCanisterId = aggregatorSnsMockDto.canister_ids.root_canister_id;
      expect(spyQuerySnsProjects).toBeCalled();

      const queryStore = get(snsQueryStore);
      expect(queryStore.metadata.length).toBeGreaterThan(0);
      expect(queryStore.swaps.length).toBeGreaterThan(0);
      const functionsStore = get(snsFunctionsStore);
      expect(functionsStore[rootCanisterId]).not.toBeUndefined();
      const feesStore = get(transactionsFeesStore);
      expect(feesStore.projects[rootCanisterId]).not.toBeUndefined();
    });

    it("should load sns aggregator store", async () => {
      jest
        .spyOn(aggregatorApi, "querySnsProjects")
        .mockImplementation(() => Promise.resolve(aggregatorMockSnsesDataDto));

      expect(get(snsAggregatorStore).data).toBeUndefined();

      await loadSnsProjects();

      expect(get(snsAggregatorStore).data).toEqual(aggregatorMockSnsesDataDto);
    });

    it("should load and map tokens", async () => {
      jest
        .spyOn(aggregatorApi, "querySnsProjects")
        .mockImplementation(() =>
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
      jest
        .spyOn(aggregatorApi, "querySnsProjects")
        .mockImplementation(() => Promise.resolve(response));

      await loadSnsProjects();

      const supplies = get(snsTotalTokenSupplyStore);
      const data = supplies[rootCanisterId.toText()];
      expect(data).not.toBeUndefined();
      expect(data?.certified).toBeTruthy();
      expect(data?.totalSupply).toEqual(BigInt(totalSupply));
    });

    it("loads derived state from property derived state", async () => {
      jest
        .spyOn(aggregatorApi, "querySnsProjects")
        .mockImplementation(() => Promise.resolve([aggregatorSnsMockDto]));

      await loadSnsProjects();

      const queryStore = get(snsQueryStore);
      const derivedState = queryStore.swaps[0]?.derived[0];
      const expectedDerivedState = aggregatorSnsMockDto.derived_state;
      expect(derivedState.buyer_total_icp_e8s).toBe(
        BigInt(expectedDerivedState.buyer_total_icp_e8s)
      );
      expect(derivedState.sns_tokens_per_icp).toBe(
        expectedDerivedState.sns_tokens_per_icp
      );
      expect(derivedState.cf_neuron_count[0]).toBe(
        BigInt(expectedDerivedState.cf_neuron_count)
      );
      expect(derivedState.cf_participant_count[0]).toBe(
        BigInt(expectedDerivedState.cf_participant_count)
      );
      expect(derivedState.direct_participant_count[0]).toBe(
        BigInt(expectedDerivedState.direct_participant_count)
      );
    });
  });
});
