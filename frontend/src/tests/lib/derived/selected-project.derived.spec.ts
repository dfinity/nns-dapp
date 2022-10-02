/**
 * @jest-environment jsdom
 */
import { get } from "svelte/store";
import { OWN_CANISTER_ID } from "../../../lib/constants/canister-ids.constants";
import { AppPath, CONTEXT_PATH } from "../../../lib/constants/routes.constants";
import {
  isNnsProjectStore,
  snsOnlyProjectStore,
  snsProjectSelectedStore,
} from "../../../lib/derived/selected-project.derived";
import { routeStore } from "../../../lib/stores/route.store";

describe("selected project derived stores", () => {
  describe("isNnsProjectStore", () => {
    beforeEach(() => {
      routeStore.update({ path: AppPath.LegacyAccounts });
    });

    it("should be set by default true", () => {
      const $store = get(isNnsProjectStore);

      expect($store).toEqual(true);
    });

    it("should be false if an sns project is selected", () => {
      routeStore.update({ path: `${CONTEXT_PATH}/aaaaa-aa/neuron/12344` });
      const $store = get(isNnsProjectStore);

      expect($store).toBe(false);
    });
  });

  describe("snsOnlyProjectStore", () => {
    beforeEach(() => {
      routeStore.update({ path: AppPath.LegacyAccounts });
    });

    it("should be set by default undefined", () => {
      const $store = get(snsOnlyProjectStore);

      expect($store).toBeUndefined();
    });

    it("should return project principal if an sns project is selected", () => {
      const principalString = "aaaaa-aa";
      routeStore.update({
        path: `${CONTEXT_PATH}/${principalString}/neuron/12344`,
      });
      const $store = get(snsOnlyProjectStore);

      expect($store?.toText()).toBe(principalString);
    });

    it("should return undefined if nns is selected after sns project", () => {
      const principalString = "aaaaa-aa";
      routeStore.update({
        path: `${CONTEXT_PATH}/${principalString}/neuron/12344`,
      });

      const $store = get(snsOnlyProjectStore);
      expect($store?.toText()).toBe(principalString);

      routeStore.update({ path: AppPath.LegacyAccounts });
      const $store2 = get(snsOnlyProjectStore);
      expect($store2).toBeUndefined();
    });
  });

  describe("snsProjectSelectedStore", () => {
    beforeEach(() => {
      routeStore.update({ path: AppPath.LegacyAccounts });
    });

    it("should be set by default to own canister id", () => {
      const $store = get(snsProjectSelectedStore);

      expect($store).toEqual(OWN_CANISTER_ID);
    });

    it("should able to set it to another project id", () => {
      const $store1 = get(snsProjectSelectedStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      const newPrincipalString = "aaaaa-aa";
      routeStore.update({
        path: `${CONTEXT_PATH}/${newPrincipalString}/neuron/12344`,
      });

      const $store2 = get(snsProjectSelectedStore);
      expect($store2.toText()).toEqual(newPrincipalString);
    });

    it("returns OWN_CANISTER_ID if context is not a valid principal id", () => {
      const $store1 = get(snsProjectSelectedStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      const newPrincipalString = "invalid-principal";
      routeStore.update({
        path: `${CONTEXT_PATH}/${newPrincipalString}/neuron/12344`,
      });

      const $store2 = get(snsProjectSelectedStore);
      expect($store2.toText()).toEqual(OWN_CANISTER_ID.toText());
    });
  });
});
