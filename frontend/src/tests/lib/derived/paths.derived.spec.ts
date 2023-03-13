/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath, UNIVERSE_PARAM } from "$lib/constants/routes.constants";
import {
  accountsPathStore,
  canistersPathStore,
  neuronsPathStore,
  proposalsPathStore,
} from "$lib/derived/paths.derived";
import { page } from "$mocks/$app/stores";
import { mockSnsCanisterIdText } from "$tests/mocks/sns.api.mock";
import { get } from "svelte/store";

describe("paths derived stores", () => {
  describe("accountsPathStore", () => {
    it("should return NNS accounts path as default", () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

      const $store = get(accountsPathStore);
      expect($store).toBe(
        `${AppPath.Accounts}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should return SNS accounts path", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });

      const $store = get(accountsPathStore);
      expect($store).toBe(
        `${AppPath.Accounts}/?${UNIVERSE_PARAM}=${mockSnsCanisterIdText}`
      );
    });
  });

  describe("neuronsPathStore", () => {
    it("should return NNS neurons path as default", () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

      const $store = get(neuronsPathStore);
      expect($store).toBe(
        `${AppPath.Neurons}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should return SNS neurons path", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });

      const $store = get(neuronsPathStore);
      expect($store).toBe(
        `${AppPath.Neurons}/?${UNIVERSE_PARAM}=${mockSnsCanisterIdText}`
      );
    });
  });

  describe("proposalsPathStore", () => {
    it("should return NNS proposals path as default", () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

      const $store = get(proposalsPathStore);
      expect($store).toBe(
        `${AppPath.Proposals}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should return SNS proposals path", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });

      const $store = get(proposalsPathStore);
      expect($store).toBe(
        `${AppPath.Proposals}/?${UNIVERSE_PARAM}=${mockSnsCanisterIdText}`
      );
    });
  });

  describe("canistersPathStore", () => {
    it("should return NNS canisters path as default", () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

      const $store = get(canistersPathStore);
      expect($store).toBe(
        `${AppPath.Canisters}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
      );
    });

    it("should return SNS canisters path", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });

      const $store = get(canistersPathStore);
      expect($store).toBe(
        `${AppPath.Canisters}/?${UNIVERSE_PARAM}=${mockSnsCanisterIdText}`
      );
    });
  });
});
