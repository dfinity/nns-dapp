/**
 * @jest-environment jsdom
 */
import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  isNnsProjectStore,
  snsOnlyProjectStore,
  snsProjectSelectedStore,
} from "$lib/derived/selected-project.derived";
import { pageStore } from "$lib/stores/page.store";
import { get } from "svelte/store";
import { mockSnsCanisterIdText } from "../../mocks/sns.api.mock";

describe("selected project derived stores", () => {
  describe("isNnsProjectStore", () => {
    beforeEach(() => {
      pageStore.load({ universe: OWN_CANISTER_ID_TEXT });
    });

    it("should be set by default true", () => {
      const $store = get(isNnsProjectStore);

      expect($store).toEqual(true);
    });

    it("should be false if an sns project is selected", () => {
      pageStore.load({ universe: mockSnsCanisterIdText });
      const $store = get(isNnsProjectStore);

      expect($store).toBe(false);
    });
  });

  describe("snsOnlyProjectStore", () => {
    beforeEach(() => {
      pageStore.load({ universe: OWN_CANISTER_ID_TEXT });
    });

    it("should be set by default undefined", () => {
      const $store = get(snsOnlyProjectStore);

      expect($store).toBeUndefined();
    });

    it("should return project principal if an sns project is selected", () => {
      pageStore.load({ universe: mockSnsCanisterIdText });
      const $store = get(snsOnlyProjectStore);

      expect($store?.toText()).toBe(mockSnsCanisterIdText);
    });

    it("should return undefined if nns is selected after sns project", () => {
      pageStore.load({ universe: mockSnsCanisterIdText });

      const $store = get(snsOnlyProjectStore);
      expect($store?.toText()).toBe(mockSnsCanisterIdText);

      pageStore.load({ universe: OWN_CANISTER_ID_TEXT });

      const $store2 = get(snsOnlyProjectStore);
      expect($store2).toBeUndefined();
    });
  });

  describe("snsProjectSelectedStore", () => {
    beforeEach(() => {
      pageStore.load({ universe: OWN_CANISTER_ID_TEXT });
    });

    it("should be set by default to own canister id", () => {
      const $store = get(snsProjectSelectedStore);

      expect($store).toEqual(OWN_CANISTER_ID);
    });

    it("should able to set it to another project id", () => {
      const $store1 = get(snsProjectSelectedStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      pageStore.load({ universe: mockSnsCanisterIdText });

      const $store2 = get(snsProjectSelectedStore);
      expect($store2.toText()).toEqual(mockSnsCanisterIdText);
    });

    it("returns OWN_CANISTER_ID if context is not a valid principal id", () => {
      const $store1 = get(snsProjectSelectedStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      pageStore.load({ universe: "invalid-principal" });

      const $store2 = get(snsProjectSelectedStore);
      expect($store2.toText()).toEqual(OWN_CANISTER_ID.toText());
    });
  });
});
