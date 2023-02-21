/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as api from "$lib/api/sns.api";
import * as services from "$lib/services/sns.services";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import type { GetDerivedStateResponse } from "@dfinity/sns/dist/candid/sns_swap";
import { fromNullable } from "@dfinity/utils";
import { get } from "svelte/store";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";
import {
  mockSnsSwapCommitment,
  principal,
} from "../../mocks/sns-projects.mock";
import { snsResponsesForLifecycle } from "../../mocks/sns-response.mock";

const { getSwapAccount, loadSnsSwapCommitments } = services;

const testGetIdentityReturn = Promise.resolve(mockIdentity);

jest.mock("$lib/services/accounts.services", () => {
  return {
    getAccountIdentity: jest
      .fn()
      .mockImplementation(() => testGetIdentityReturn),
    syncAccounts: jest.fn(),
  };
});

describe("sns-services", () => {
  describe("getSwapAccount", () => {
    afterEach(() => jest.clearAllMocks());
    it("should return the swap canister account identifier", async () => {
      const account = await getSwapAccount(mockPrincipal);
      expect(account).toBeInstanceOf(AccountIdentifier);
    });
  });

  describe("loadSnsSwapCommitments", () => {
    afterEach(() => {
      jest.clearAllMocks();
      snsSwapCommitmentsStore.reset();
      snsQueryStore.reset();
    });
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
      const [metadatas, swaps] = snsResponsesForLifecycle({
        certified: true,
        lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Open],
      });
      snsQueryStore.setData([metadatas, swaps]);
      const commitment1 = mockSnsSwapCommitment(
        Principal.fromText(metadatas[0].rootCanisterId)
      );
      const commitment2 = mockSnsSwapCommitment(
        Principal.fromText(metadatas[1].rootCanisterId)
      );
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
    afterEach(() => {
      jest.clearAllMocks();
      snsSwapCommitmentsStore.reset();
      snsQueryStore.reset();
    });

    it("should call api to get total commitments and load them in store", async () => {
      const derivedState: GetDerivedStateResponse = {
        sns_tokens_per_icp: [1],
        buyer_total_icp_e8s: [BigInt(1_000_000_000)],
      };
      const [metadatas, swaps] = snsResponsesForLifecycle({
        certified: true,
        lifecycles: [SnsSwapLifecycle.Open, SnsSwapLifecycle.Open],
      });
      snsQueryStore.setData([metadatas, swaps]);
      const canisterId = swaps[0].rootCanisterId;

      const spy = jest
        .spyOn(api, "querySnsDerivedState")
        .mockImplementation(() => Promise.resolve(derivedState));

      const initStore = get(snsQueryStore);
      const initState = initStore?.swaps.find(
        (swap) => swap.rootCanisterId === canisterId
      )?.derived[0];
      expect(initState?.buyer_total_icp_e8s).toEqual(
        initState?.buyer_total_icp_e8s
      );
      expect(initState?.sns_tokens_per_icp).toEqual(
        initState?.sns_tokens_per_icp
      );

      await services.loadSnsTotalCommitment({
        rootCanisterId: canisterId,
      });
      expect(spy).toBeCalled();

      const updatedStore = get(snsQueryStore);
      const updatedState = updatedStore?.swaps.find(
        (swap) => swap.rootCanisterId === canisterId
      )?.derived[0];
      expect(updatedState?.buyer_total_icp_e8s).toEqual(
        fromNullable(derivedState.buyer_total_icp_e8s)
      );
      expect(updatedState?.sns_tokens_per_icp).toEqual(
        fromNullable(derivedState.sns_tokens_per_icp)
      );
    });
  });
});
