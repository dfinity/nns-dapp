/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as api from "$lib/api/sns.api";
import * as services from "$lib/services/sns.services";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { AccountIdentifier } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
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
});
