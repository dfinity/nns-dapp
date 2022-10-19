/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  accountsPathStore,
  canistersPathStore,
  neuronsPathStore,
  proposalsPathStore,
} from "$lib/derived/paths.derived";
import { page } from "$mocks/$app/stores";
import { get } from "svelte/store";
import { mockSnsCanisterIdText } from "../../mocks/sns.api.mock";

describe("paths derived stores", () => {
  describe("accountsPathStore", () => {
    it("should return NNS accounts path as default", () => {
      page.mock({ universe: OWN_CANISTER_ID_TEXT });

      const $store = get(accountsPathStore);
      expect($store).toBe(`${AppPath.Accounts}/?u=${OWN_CANISTER_ID_TEXT}`);
    });

    it("should return SNS accounts path", () => {
      page.mock({ universe: mockSnsCanisterIdText });

      const $store = get(accountsPathStore);
      expect($store).toBe(`${AppPath.Accounts}/?u=${mockSnsCanisterIdText}`);
    });
  });

  describe("neuronsPathStore", () => {
    it("should return NNS neurons path as default", () => {
      page.mock({ universe: OWN_CANISTER_ID_TEXT });

      const $store = get(neuronsPathStore);
      expect($store).toBe(`${AppPath.Neurons}/?u=${OWN_CANISTER_ID_TEXT}`);
    });

    it("should return SNS neurons path", () => {
      page.mock({ universe: mockSnsCanisterIdText });

      const $store = get(neuronsPathStore);
      expect($store).toBe(`${AppPath.Neurons}/?u=${mockSnsCanisterIdText}`);
    });
  });

  describe("proposalsPathStore", () => {
    it("should return NNS proposals path as default", () => {
      page.mock({ universe: OWN_CANISTER_ID_TEXT });

      const $store = get(proposalsPathStore);
      expect($store).toBe(`${AppPath.Proposals}/?u=${OWN_CANISTER_ID_TEXT}`);
    });

    it("should return SNS proposals path", () => {
      page.mock({ universe: mockSnsCanisterIdText });

      const $store = get(proposalsPathStore);
      expect($store).toBe(`${AppPath.Proposals}/?u=${mockSnsCanisterIdText}`);
    });
  });

  describe("canistersPathStore", () => {
    it("should return NNS canisters path as default", () => {
      page.mock({ universe: OWN_CANISTER_ID_TEXT });

      const $store = get(canistersPathStore);
      expect($store).toBe(`${AppPath.Canisters}/?u=${OWN_CANISTER_ID_TEXT}`);
    });

    it("should return SNS canisters path", () => {
      page.mock({ universe: mockSnsCanisterIdText });

      const $store = get(canistersPathStore);
      expect($store).toBe(`${AppPath.Canisters}/?u=${mockSnsCanisterIdText}`);
    });
  });
});
