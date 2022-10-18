/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppRoutes } from "$lib/constants/routes.constants";
import {
  accountsPathStore,
  canistersPathStore,
  neuronsPathStore,
  proposalsPathStore,
} from "$lib/derived/paths.derived";
import { pageStore } from "$lib/stores/page.store";
import { get } from "svelte/store";
import { mockSnsCanisterIdText } from "../../mocks/sns.api.mock";

describe("paths derived stores", () => {
  describe("accountsPathStore", () => {
    it("should return NNS accounts path as default", () => {
      pageStore.load({ universe: OWN_CANISTER_ID_TEXT });

      const $store = get(accountsPathStore);
      expect($store).toBe(`${AppRoutes.Accounts}/?u=${OWN_CANISTER_ID_TEXT}`);
    });

    it("should return SNS accounts path", () => {
      pageStore.load({ universe: mockSnsCanisterIdText });

      const $store = get(accountsPathStore);
      expect($store).toBe(`${AppRoutes.Accounts}/?u=${mockSnsCanisterIdText}`);
    });
  });

  describe("neuronsPathStore", () => {
    it("should return NNS neurons path as default", () => {
      pageStore.load({ universe: OWN_CANISTER_ID_TEXT });

      const $store = get(neuronsPathStore);
      expect($store).toBe(`${AppRoutes.Accounts}/?u=${OWN_CANISTER_ID_TEXT}`);
    });

    it("should return SNS neurons path", () => {
      pageStore.load({ universe: mockSnsCanisterIdText });

      const $store = get(neuronsPathStore);
      expect($store).toBe(`${AppRoutes.Accounts}/?u=${mockSnsCanisterIdText}`);
    });
  });

  describe("proposalsPathStore", () => {
    it("should return NNS proposals path as default", () => {
      pageStore.load({ universe: OWN_CANISTER_ID_TEXT });

      const $store = get(proposalsPathStore);
      expect($store).toBe(`${AppRoutes.Accounts}/?u=${OWN_CANISTER_ID_TEXT}`);
    });

    it("should return SNS proposals path", () => {
      pageStore.load({ universe: mockSnsCanisterIdText });

      const $store = get(proposalsPathStore);
      expect($store).toBe(`${AppRoutes.Accounts}/?u=${mockSnsCanisterIdText}`);
    });
  });

  describe("canistersPathStore", () => {
    it("should return NNS canisters path as default", () => {
      pageStore.load({ universe: OWN_CANISTER_ID_TEXT });

      const $store = get(canistersPathStore);
      expect($store).toBe(`${AppRoutes.Accounts}/?u=${OWN_CANISTER_ID_TEXT}`);
    });

    it("should return SNS canisters path", () => {
      pageStore.load({ universe: mockSnsCanisterIdText });

      const $store = get(canistersPathStore);
      expect($store).toBe(`${AppRoutes.Accounts}/?u=${mockSnsCanisterIdText}`);
    });
  });
});
