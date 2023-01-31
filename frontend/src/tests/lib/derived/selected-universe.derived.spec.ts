/**
 * @jest-environment jsdom
 */
import {
  CKBTC_LEDGER_CANISTER_ID,
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  isCkBTCUniverseStore,
  isNnsUniverseStore,
  selectedUniverseIdStore,
} from "$lib/derived/selected-universe.derived";
import { page } from "$mocks/$app/stores";
import { get } from "svelte/store";
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
        data: { universe: CKBTC_LEDGER_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });
    });

    it("should be ckBTC universe", () => {
      const $store = get(isCkBTCUniverseStore);

      expect($store).toEqual(true);
    });

    it("should not be ckBTC universe", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });
      const $store = get(isCkBTCUniverseStore);

      expect($store).toBe(false);
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
