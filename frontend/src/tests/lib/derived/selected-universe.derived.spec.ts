/**
 * @jest-environment jsdom
 */
import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  isCkBTCUniverseStore,
  isNnsUniverseStore,
  selectedUniverseIdStore,
} from "$lib/derived/selected-universe.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { page } from "$mocks/$app/stores";
import { get } from "svelte/store";
import { CKBTC_UNIVERSE_CANISTER_ID } from "../../../lib/constants/ckbtc-canister-ids.constants";
import { mockSnsCanisterIdText } from "../../mocks/sns.api.mock";

describe("selected universe derived stores", () => {
  describe("isNnsUniverseStore", () => {
    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    });

    it("should be set by default true", () => {
      const $store = get(isNnsUniverseStore);

      expect($store).toEqual(true);
    });

    it("should be false if an sns project is selected", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });
      const $store = get(isNnsUniverseStore);

      expect($store).toBe(false);
    });
  });

  describe("isCkBTCUniverseStore", () => {
    beforeEach(() => {
      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });
    });

    it("should be ckBTC inside ckBTC universe", () => {
      const $store = get(isCkBTCUniverseStore);

      expect($store).toEqual(true);
    });

    it("should not be ckBTC outside ckBTC universe", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });
      const $store = get(isCkBTCUniverseStore);

      expect($store).toBe(false);
    });

    it("should not be ckBTC with feature flag disabled", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
      expect(get(isCkBTCUniverseStore)).toBe(true);

      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
      expect(get(isCkBTCUniverseStore)).toBe(false);
    });
  });

  describe("snsUniverseIdSelectedStore", () => {
    beforeEach(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    });

    it("should be set by default to own canister id", () => {
      const $store = get(selectedUniverseIdStore);

      expect($store).toEqual(OWN_CANISTER_ID);
    });

    it("should able to set it to another project id", () => {
      const $store1 = get(selectedUniverseIdStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      page.mock({ data: { universe: mockSnsCanisterIdText } });

      const $store2 = get(selectedUniverseIdStore);
      expect($store2.toText()).toEqual(mockSnsCanisterIdText);
    });

    it("returns OWN_CANISTER_ID if context is not a valid principal id", () => {
      const $store1 = get(selectedUniverseIdStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      page.mock({ data: { universe: "invalid-principal" } });

      const $store2 = get(selectedUniverseIdStore);
      expect($store2.toText()).toEqual(OWN_CANISTER_ID.toText());
    });
  });
});
