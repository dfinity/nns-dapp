/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as api from "$lib/api/sns.api";
import { WATCH_SALE_STATE_EVERY_MILLISECONDS } from "$lib/constants/sns.constants";
import * as services from "$lib/services/sns.services";
import { snsDerivedStateStore } from "$lib/stores/sns-derived-state.store";
import { getOrCreateLifecycleStore } from "$lib/stores/sns-lifecycle.store";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import {
  mockIdentity,
  mockPrincipal,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockSnsSwapCommitment,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { AccountIdentifier } from "@dfinity/nns";
import type {
  SnsGetDerivedStateResponse,
  SnsGetLifecycleResponse,
} from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

const {
  getSwapAccount,
  loadSnsSwapCommitments,
  loadSnsSwapCommitment,
  loadSnsTotalCommitment,
  watchSnsTotalCommitment,
} = services;

describe("sns-services", () => {
  const rootCanisterId1 = principal(0);
  const rootCanisterId2 = principal(1);

  beforeEach(() => {
    resetIdentity();
    jest.useFakeTimers();
    jest.clearAllTimers();
    jest.clearAllMocks();
    snsSwapCommitmentsStore.reset();
    snsQueryStore.reset();
    snsDerivedStateStore.reset();
  });

  describe("getSwapAccount", () => {
    it("should return the swap canister account identifier", async () => {
      const account = await getSwapAccount(mockPrincipal);
      expect(account).toBeInstanceOf(AccountIdentifier);
    });
  });

  describe("loadSnsSwapCommitments", () => {
    it("should call api to get commitments and load them in store", async () => {
      const commitment1 = mockSnsSwapCommitment(principal(0));
      const commitment2 = mockSnsSwapCommitment(principal(1));
      const commitments = [commitment1, commitment2];
      const spy = jest
        .spyOn(api, "querySnsSwapCommitments")
        .mockImplementation(() => Promise.resolve(commitments));
      await loadSnsSwapCommitments();
      expect(spy).toBeCalled();

      const store = get(snsSwapCommitmentsStore);
      expect(store).toHaveLength(commitments.length);
    });

    it("should not call api if they are loaded in store", async () => {
      setSnsProjects([
        {
          rootCanisterId: rootCanisterId1,
          lifecycle: SnsSwapLifecycle.Open,
        },
        {
          rootCanisterId: rootCanisterId2,
          lifecycle: SnsSwapLifecycle.Open,
        },
      ]);

      const commitment1 = mockSnsSwapCommitment(rootCanisterId1);
      const commitment2 = mockSnsSwapCommitment(rootCanisterId2);
      const commitments = [commitment1, commitment2];
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: commitment1,
        certified: true,
      });
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: commitment2,
        certified: true,
      });
      const spy = jest
        .spyOn(api, "querySnsSwapCommitments")
        .mockImplementation(() => Promise.resolve(commitments));
      await loadSnsSwapCommitments();
      expect(spy).not.toBeCalled();
    });
  });

  describe("loadSnsTotalCommitment", () => {
    it("should call api to get total commitments and load them in stores", async () => {
      const derivedState: SnsGetDerivedStateResponse = {
        sns_tokens_per_icp: [2],
        buyer_total_icp_e8s: [BigInt(1_000_000_000)],
        cf_participant_count: [],
        direct_participant_count: [],
        cf_neuron_count: [],
      };
      setSnsProjects([
        {
          rootCanisterId: rootCanisterId1,
          lifecycle: SnsSwapLifecycle.Open,
        },
        {
          rootCanisterId: rootCanisterId2,
          lifecycle: SnsSwapLifecycle.Open,
        },
      ]);

      const spy = jest
        .spyOn(api, "querySnsDerivedState")
        .mockImplementation(() => Promise.resolve(derivedState));

      const initStore = get(snsQueryStore);
      const initState = initStore.swaps.find(
        (swap) => swap.rootCanisterId === rootCanisterId1.toText()
      )?.derived[0];
      expect(initState.buyer_total_icp_e8s).not.toEqual(
        fromNullable(derivedState.buyer_total_icp_e8s)
      );
      expect(initState.sns_tokens_per_icp).not.toEqual(
        fromNullable(derivedState.sns_tokens_per_icp)
      );

      await loadSnsTotalCommitment({
        rootCanisterId: rootCanisterId1.toText(),
      });
      expect(spy).toBeCalled();

      const updatedStore = get(snsQueryStore);
      const updatedState = updatedStore.swaps.find(
        (swap) => swap.rootCanisterId === rootCanisterId1.toText()
      )?.derived[0];
      expect(updatedState?.buyer_total_icp_e8s).toEqual(
        fromNullable(derivedState.buyer_total_icp_e8s)
      );
      expect(updatedState?.sns_tokens_per_icp).toEqual(
        fromNullable(derivedState.sns_tokens_per_icp)
      );

      expect(
        get(snsDerivedStateStore)[rootCanisterId1.toText()]?.derivedState
      ).toEqual(derivedState);
    });

    it("should call api with the strategy passed", async () => {
      const derivedState: SnsGetDerivedStateResponse = {
        sns_tokens_per_icp: [1],
        buyer_total_icp_e8s: [BigInt(1_000_000_000)],
        cf_participant_count: [],
        direct_participant_count: [],
        cf_neuron_count: [],
      };
      const spy = jest
        .spyOn(api, "querySnsDerivedState")
        .mockImplementation(() => Promise.resolve(derivedState));

      await loadSnsTotalCommitment({
        rootCanisterId: mockPrincipal.toText(),
        strategy: "update",
      });

      expect(spy).toBeCalledWith({
        rootCanisterId: mockPrincipal.toText(),
        identity: mockIdentity,
        certified: true,
      });
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe("watchSnsTotalCommitment", () => {
    it("should call api to get total commitments and load them in store and keep polling", async () => {
      const derivedState: SnsGetDerivedStateResponse = {
        sns_tokens_per_icp: [2],
        buyer_total_icp_e8s: [BigInt(2_000_000_000)],
        cf_participant_count: [],
        direct_participant_count: [],
        cf_neuron_count: [],
      };
      setSnsProjects([
        {
          rootCanisterId: rootCanisterId1,
          lifecycle: SnsSwapLifecycle.Open,
        },
        {
          rootCanisterId: rootCanisterId2,
          lifecycle: SnsSwapLifecycle.Open,
        },
      ]);

      const initStore = get(snsQueryStore);
      const initState = initStore.swaps.find(
        (swap) => swap.rootCanisterId === rootCanisterId1.toText()
      )?.derived[0];
      expect(initState.buyer_total_icp_e8s).not.toEqual(
        fromNullable(derivedState.buyer_total_icp_e8s)
      );
      expect(initState.sns_tokens_per_icp).not.toEqual(
        fromNullable(derivedState.sns_tokens_per_icp)
      );

      const spy = jest
        .spyOn(api, "querySnsDerivedState")
        .mockResolvedValue(derivedState);

      const clearWatch = watchSnsTotalCommitment({
        rootCanisterId: rootCanisterId1.toText(),
      });

      await runResolvedPromises();
      let expectedCalls = 0;
      expect(spy).toBeCalledTimes(expectedCalls);

      const callsBeforeClearing = 3;
      while (expectedCalls < callsBeforeClearing) {
        await advanceTime(WATCH_SALE_STATE_EVERY_MILLISECONDS);
        expectedCalls += 1;
        expect(spy).toBeCalledTimes(expectedCalls);
      }
      clearWatch();

      // Even after waiting a long time there shouldn't be more calls.
      expect(spy).toBeCalledTimes(expectedCalls);

      const updatedStore = get(snsQueryStore);
      const updatedState = updatedStore.swaps.find(
        (swap) => swap.rootCanisterId === rootCanisterId1.toText()
      )?.derived[0];
      expect(updatedState?.buyer_total_icp_e8s).toEqual(
        fromNullable(derivedState.buyer_total_icp_e8s)
      );
      expect(updatedState?.sns_tokens_per_icp).toEqual(
        fromNullable(derivedState.sns_tokens_per_icp)
      );
    });
  });

  describe("loadSnsSwapCommitment", () => {
    let queryCommitmentSpy: jest.SpyInstance;
    const commitment1 = mockSnsSwapCommitment(principal(0));
    beforeEach(() => {
      queryCommitmentSpy = jest
        .spyOn(api, "querySnsSwapCommitment")
        .mockImplementation(() => Promise.resolve(commitment1));
    });

    it("should call api to get commitments and load them in store", async () => {
      expect(get(snsSwapCommitmentsStore)).toBeUndefined();
      expect(queryCommitmentSpy).toBeCalledTimes(0);
      await loadSnsSwapCommitment({
        rootCanisterId: commitment1.rootCanisterId.toText(),
        forceFetch: false,
      });
      await runResolvedPromises();
      expect(queryCommitmentSpy).toBeCalledTimes(2);

      await waitFor(() =>
        expect(get(snsSwapCommitmentsStore)).not.toBeUndefined()
      );
      const commitmentInStore = get(snsSwapCommitmentsStore).find(
        ({ swapCommitment: { rootCanisterId } }) =>
          commitment1.rootCanisterId.toText() === rootCanisterId.toText()
      );
      expect(commitmentInStore.swapCommitment).toEqual(commitment1);
    });

    it("should not call api if they are loaded in store", async () => {
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: commitment1,
        certified: true,
      });

      await loadSnsSwapCommitment({
        rootCanisterId: commitment1.rootCanisterId.toText(),
        forceFetch: false,
      });
      expect(queryCommitmentSpy).not.toBeCalled();
    });

    it("should call api if they are loaded in store but forceFetch is true", async () => {
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: commitment1,
        certified: true,
      });

      await loadSnsSwapCommitment({
        rootCanisterId: commitment1.rootCanisterId.toText(),
        forceFetch: true,
      });
      await runResolvedPromises();

      expect(queryCommitmentSpy).toBeCalledTimes(1);
    });

    it("should call api with update if forceFetch is try", async () => {
      await loadSnsSwapCommitment({
        rootCanisterId: commitment1.rootCanisterId.toText(),
        forceFetch: true,
      });
      await runResolvedPromises();
      expect(queryCommitmentSpy).toBeCalledTimes(1);
      expect(queryCommitmentSpy).toBeCalledWith({
        rootCanisterId: commitment1.rootCanisterId.toText(),
        certified: true,
        identity: mockIdentity,
      });
    });
  });

  describe("loadSnsLifecycle", () => {
    it("should call api to get lifecycle and load them in store", async () => {
      const newLifeCycle = SnsSwapLifecycle.Committed;
      const lifeCycleResponse: SnsGetLifecycleResponse = {
        lifecycle: [newLifeCycle],
        decentralization_sale_open_timestamp_seconds: [BigInt(1)],
      };
      const dataLifecycle = SnsSwapLifecycle.Open;
      setSnsProjects([
        {
          rootCanisterId: rootCanisterId1,
          lifecycle: dataLifecycle,
        },
        {
          rootCanisterId: rootCanisterId2,
          lifecycle: SnsSwapLifecycle.Open,
        },
      ]);

      const spy = jest
        .spyOn(api, "querySnsLifecycle")
        .mockImplementation(() => Promise.resolve(lifeCycleResponse));

      const initStore = get(snsQueryStore);
      const initLifecycle = initStore?.swaps.find(
        (swap) => swap.rootCanisterId === rootCanisterId1.toText()
      )?.swap[0].lifecycle;
      expect(initLifecycle).toEqual(dataLifecycle);

      await services.loadSnsLifecycle({
        rootCanisterId: rootCanisterId1.toText(),
      });
      expect(spy).toBeCalled();

      const updatedStore = get(snsQueryStore);
      const updatedLifecycle = updatedStore?.swaps.find(
        (swap) => swap.rootCanisterId === rootCanisterId1.toText()
      )?.swap[0].lifecycle;
      expect(updatedLifecycle).toEqual(newLifeCycle);

      const lifecycleStore = getOrCreateLifecycleStore(rootCanisterId1);
      expect(get(lifecycleStore).data).toEqual(lifeCycleResponse);
    });
  });
});
