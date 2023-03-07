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
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import {
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import {
  aggregatorSnsMock,
  aggregatorTokenMock,
} from "$tests/mocks/sns-aggregator.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";

jest.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: jest.fn(),
  };
});

describe("SNS public services", () => {
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
    afterEach(() => {
      snsQueryStore.reset();
      snsFunctionsStore.reset();
      transactionsFeesStore.reset();
      jest.clearAllMocks();
      jest
        .spyOn(authStore, "subscribe")
        .mockImplementation(mockAuthStoreSubscribe);
    });
    it("loads sns stores with data", async () => {
      const spyQuerySnsProjects = jest
        .spyOn(aggregatorApi, "querySnsProjects")
        .mockImplementation(() => Promise.resolve([aggregatorSnsMock]));

      await loadSnsProjects();

      const rootCanisterId = aggregatorSnsMock.canister_ids.root_canister_id;
      expect(spyQuerySnsProjects).toBeCalled();

      const queryStore = get(snsQueryStore);
      expect(queryStore.metadata.length).toBeGreaterThan(0);
      expect(queryStore.swaps.length).toBeGreaterThan(0);
      const functionsStore = get(snsFunctionsStore);
      expect(functionsStore[rootCanisterId]).not.toBeUndefined();
      const feesStore = get(transactionsFeesStore);
      expect(feesStore.projects[rootCanisterId]).not.toBeUndefined();
    });

    it("should load and map tokens", async () => {
      jest
        .spyOn(aggregatorApi, "querySnsProjects")
        .mockImplementation(() => Promise.resolve([aggregatorSnsMock]));

      await loadSnsProjects();

      const rootCanisterId = aggregatorSnsMock.canister_ids.root_canister_id;

      const tokens = get(tokensStore);
      const token = tokens[rootCanisterId];
      expect(token).not.toBeUndefined();
      expect(token?.certified).toBeTruthy();
      expect(token?.token).toEqual(aggregatorTokenMock);
    });
  });
});
