import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath, UNIVERSE_PARAM } from "$lib/constants/routes.constants";
import {
  accountsPathStore,
  canistersPathStore,
  neuronsPathStore,
  proposalsPathStore,
  tokensPathStore,
} from "$lib/derived/paths.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { page } from "$mocks/$app/stores";
import { mockSnsCanisterIdText } from "$tests/mocks/sns.api.mock";
import { get } from "svelte/store";

describe("paths derived stores", () => {
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
  });

  describe("tokensPathStore", () => {
    describe("when My Tokens feature is enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      });

      it("should return the tokens path if universe is not NNS", () => {
        page.mock({ data: { universe: mockSnsCanisterIdText } });

        expect(get(tokensPathStore)).toBe(AppPath.Tokens);
      });
    });

    describe("when My Tokens feature is disabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
      });

      it("should return the accounts path", () => {
        page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

        expect(get(tokensPathStore)).toBe(
          `${AppPath.Accounts}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
        );
      });
    });
  });

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

    describe("when My Tokens feature is enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);
      });

      it("should return the tokens path if universe is not NNS", () => {
        page.mock({ data: { universe: mockSnsCanisterIdText } });

        expect(get(accountsPathStore)).toBe(AppPath.Tokens);
      });

      it("should return the NNS accounts path if universe is NNS", () => {
        page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

        expect(get(accountsPathStore)).toBe(
          `${AppPath.Accounts}/?${UNIVERSE_PARAM}=${OWN_CANISTER_ID_TEXT}`
        );
      });
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
