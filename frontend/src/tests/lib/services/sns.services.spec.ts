import * as api from "$lib/api/sns.api";
import { WATCH_SALE_STATE_EVERY_MILLISECONDS } from "$lib/constants/sns.constants";
import * as services from "$lib/services/sns.services";
import { snsDerivedStateStore } from "$lib/stores/sns-derived-state.store";
import { snsLifecycleStore } from "$lib/stores/sns-lifecycle.store";
import { snsSwapCommitmentsStore } from "$lib/stores/sns.store";
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
import { toastsStore } from "@dfinity/gix-components";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import type {
  SnsGetDerivedStateResponse,
  SnsGetLifecycleResponse,
} from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import type { MockInstance } from "vitest";

const {
  getSwapAccount,
  loadSnsSwapCommitments,
  loadSnsSwapCommitment,
  loadSnsDerivedState,
  watchSnsTotalCommitment,
} = services;

describe("sns-services", () => {
  const rootCanisterId1 = principal(0);
  const rootCanisterId2 = principal(1);

  beforeEach(() => {
    resetIdentity();
    vi.useFakeTimers();
  });

  describe("getSwapAccount", () => {
    it("should return the swap canister account identifier", async () => {
      const account = await getSwapAccount(mockPrincipal);
      expect(account).toBeInstanceOf(AccountIdentifier);
    });
  });

  describe("loadSnsSwapCommitments", () => {
    it("should call api to get commitments and load them in store", async () => {
      setSnsProjects([
        { rootCanisterId: rootCanisterId1 },
        { rootCanisterId: rootCanisterId2 },
      ]);
      const commitment1 = mockSnsSwapCommitment(rootCanisterId1);
      const commitment2 = mockSnsSwapCommitment(rootCanisterId2);
      const commitments = [commitment1, commitment2];
      const spy = vi
        .spyOn(api, "querySnsSwapCommitment")
        .mockImplementation(async ({ rootCanisterId }) =>
          commitments.find(
            (commitment) =>
              commitment.rootCanisterId.toText() === rootCanisterId
          )
        );

      await loadSnsSwapCommitments();

      expect(spy).toBeCalledTimes(4);
      expect(spy).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
        rootCanisterId: rootCanisterId1.toText(),
      });
      expect(spy).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
        rootCanisterId: rootCanisterId2.toText(),
      });
      expect(spy).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        rootCanisterId: rootCanisterId1.toText(),
      });
      expect(spy).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        rootCanisterId: rootCanisterId2.toText(),
      });

      const store = get(snsSwapCommitmentsStore);
      expect(store).toEqual([
        { swapCommitment: commitment1, certified: true },
        { swapCommitment: commitment2, certified: true },
      ]);
    });

    it("should show toast and load remaining commitments on error", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockReturnValue();
      const commitment2 = mockSnsSwapCommitment(rootCanisterId2);
      const errorMessage = "Error fetching commitment";
      const error = new Error(errorMessage);
      const spy = vi
        .spyOn(api, "querySnsSwapCommitment")
        .mockImplementation(async ({ rootCanisterId }) => {
          if (rootCanisterId === rootCanisterId1.toText()) {
            throw error;
          }
          return commitment2;
        });

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

      expect(get(snsSwapCommitmentsStore)).toBeUndefined();
      expect(get(toastsStore)).toEqual([]);

      await loadSnsSwapCommitments();
      expect(spy).toBeCalled();

      expect(get(snsSwapCommitmentsStore)).toEqual([
        { swapCommitment: commitment2, certified: true },
      ]);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `There was an unexpected error while loading the commitment of the project. ${errorMessage}`,
        },
      ]);

      // loadSnsSwapCommitment logs the error for the certified and uncertified
      // call but toastsError logs it again for a total of 3 times.
      // I'm not sure this is desired but this is what's currently implemented.
      expect(consoleErrorSpy).toBeCalledTimes(3);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, error);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, error);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(3, error);
    });

    it("should not show toast on uncertified error", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const commitment1 = mockSnsSwapCommitment(principal(0));

      const errorMessage = "Error fetching commitments";
      const spy = vi
        .spyOn(api, "querySnsSwapCommitment")
        .mockImplementation(async ({ certified }) => {
          if (!certified) {
            throw new Error(errorMessage);
          }
          return commitment1;
        });

      setSnsProjects([
        {
          rootCanisterId: rootCanisterId1,
          lifecycle: SnsSwapLifecycle.Open,
        },
      ]);

      expect(get(snsSwapCommitmentsStore)).toBeUndefined();
      expect(get(toastsStore)).toEqual([]);

      await loadSnsSwapCommitments();
      expect(spy).toBeCalled();

      expect(get(snsSwapCommitmentsStore)).not.toBe(undefined);
      expect(get(toastsStore)).toEqual([]);
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
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: commitment1,
        certified: true,
      });
      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: commitment2,
        certified: true,
      });
      const spy = vi
        .spyOn(api, "querySnsSwapCommitment")
        .mockImplementation(() => Promise.resolve(commitment1));
      await loadSnsSwapCommitments();
      expect(spy).not.toBeCalled();
    });

    it("should only call api for commitments not yet loaded", async () => {
      setSnsProjects([
        { rootCanisterId: rootCanisterId1 },
        { rootCanisterId: rootCanisterId2 },
      ]);
      const commitment1 = mockSnsSwapCommitment(rootCanisterId1);
      const commitment2 = mockSnsSwapCommitment(rootCanisterId2);
      const commitments = [commitment1, commitment2];
      const spy = vi
        .spyOn(api, "querySnsSwapCommitment")
        .mockImplementation(async ({ rootCanisterId }) =>
          commitments.find(
            (commitment) =>
              commitment.rootCanisterId.toText() === rootCanisterId
          )
        );

      snsSwapCommitmentsStore.setSwapCommitment({
        swapCommitment: commitment1,
        certified: true,
      });

      await loadSnsSwapCommitments();

      expect(spy).toBeCalledTimes(2);
      expect(spy).toBeCalledWith({
        certified: false,
        identity: mockIdentity,
        rootCanisterId: rootCanisterId2.toText(),
      });
      expect(spy).toBeCalledWith({
        certified: true,
        identity: mockIdentity,
        rootCanisterId: rootCanisterId2.toText(),
      });

      const store = get(snsSwapCommitmentsStore);
      expect(store).toEqual([
        { swapCommitment: commitment1, certified: true },
        { swapCommitment: commitment2, certified: true },
      ]);
    });
  });

  describe("loadSnsDerivedState", () => {
    it("should call api to get total commitments and load them in stores", async () => {
      const derivedState: SnsGetDerivedStateResponse = {
        sns_tokens_per_icp: [2],
        buyer_total_icp_e8s: [1_000_000_000n],
        cf_participant_count: [],
        direct_participant_count: [],
        cf_neuron_count: [],
        direct_participation_icp_e8s: [],
        neurons_fund_participation_icp_e8s: [],
      };

      const spy = vi
        .spyOn(api, "querySnsDerivedState")
        .mockImplementation(() => Promise.resolve(derivedState));

      await loadSnsDerivedState({
        rootCanisterId: rootCanisterId1.toText(),
      });
      expect(spy).toBeCalled();

      expect(
        get(snsDerivedStateStore)[rootCanisterId1.toText()]?.derivedState
      ).toEqual(derivedState);
    });

    it("should call api with the strategy passed", async () => {
      const derivedState: SnsGetDerivedStateResponse = {
        sns_tokens_per_icp: [1],
        buyer_total_icp_e8s: [1_000_000_000n],
        cf_participant_count: [],
        direct_participant_count: [],
        cf_neuron_count: [],
        direct_participation_icp_e8s: [],
        neurons_fund_participation_icp_e8s: [],
      };
      const spy = vi
        .spyOn(api, "querySnsDerivedState")
        .mockImplementation(() => Promise.resolve(derivedState));

      await loadSnsDerivedState({
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
        buyer_total_icp_e8s: [2_000_000_000n],
        cf_participant_count: [],
        direct_participant_count: [],
        cf_neuron_count: [],
        direct_participation_icp_e8s: [],
        neurons_fund_participation_icp_e8s: [],
      };

      const spy = vi
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

      expect(
        get(snsDerivedStateStore)[rootCanisterId1.toText()]?.derivedState
      ).toEqual(derivedState);
    });
  });

  describe("loadSnsSwapCommitment", () => {
    let queryCommitmentSpy: MockInstance;
    const commitment1 = mockSnsSwapCommitment(principal(0));
    beforeEach(() => {
      queryCommitmentSpy = vi
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

    it("should show toast on error", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const errorMessage = "Error fetching commitment";
      queryCommitmentSpy = vi
        .spyOn(api, "querySnsSwapCommitment")
        .mockRejectedValue(new Error(errorMessage));

      expect(get(snsSwapCommitmentsStore)).toBeUndefined();
      expect(queryCommitmentSpy).toBeCalledTimes(0);
      expect(get(toastsStore)).toEqual([]);

      await loadSnsSwapCommitment({
        rootCanisterId: commitment1.rootCanisterId.toText(),
        forceFetch: false,
      });
      await runResolvedPromises();

      expect(get(snsSwapCommitmentsStore)).toBeUndefined();
      expect(queryCommitmentSpy).toBeCalledTimes(2);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `There was an unexpected error while loading the commitment of the project. ${errorMessage}`,
        },
      ]);
    });

    it("should not show toast on uncertified error", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const errorMessage = "Error fetching commitment";
      const commitment = mockSnsSwapCommitment(principal(0));
      queryCommitmentSpy = vi
        .spyOn(api, "querySnsSwapCommitment")
        .mockImplementation(async ({ certified }) => {
          if (!certified) {
            throw new Error(errorMessage);
          }
          return commitment;
        });

      expect(get(snsSwapCommitmentsStore)).toBeUndefined();
      expect(queryCommitmentSpy).toBeCalledTimes(0);
      expect(get(toastsStore)).toEqual([]);

      await loadSnsSwapCommitment({
        rootCanisterId: commitment1.rootCanisterId.toText(),
        forceFetch: false,
      });
      await runResolvedPromises();

      const commitmentInStore = get(snsSwapCommitmentsStore).find(
        ({ swapCommitment: { rootCanisterId } }) =>
          commitment1.rootCanisterId.toText() === rootCanisterId.toText()
      );
      expect(commitmentInStore.swapCommitment).toEqual(commitment);
      expect(queryCommitmentSpy).toBeCalledTimes(2);
      expect(get(toastsStore)).toEqual([]);
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
        decentralization_sale_open_timestamp_seconds: [1n],
        decentralization_swap_termination_timestamp_seconds: [],
      };

      const spy = vi
        .spyOn(api, "querySnsLifecycle")
        .mockImplementation(() => Promise.resolve(lifeCycleResponse));

      await services.loadSnsLifecycle({
        rootCanisterId: rootCanisterId1.toText(),
      });
      expect(spy).toBeCalled();

      expect(get(snsLifecycleStore)[rootCanisterId1.toText()].data).toEqual(
        lifeCycleResponse
      );
    });
  });
});
