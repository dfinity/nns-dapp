import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";
import {
  isCkBTCUniverseStore,
  isNnsUniverseStore,
  selectedCkBTCUniverseIdStore,
  selectedUniverseIdStore,
  selectedUniverseStore,
} from "$lib/derived/selected-universe.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import {
  mockSnsCanisterId,
  mockSnsCanisterIdText,
} from "$tests/mocks/sns.api.mock";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("selected universe derived stores", () => {
  beforeEach(() => {
    snsQueryStore.reset();
    snsQueryStore.setData(
      snsResponseFor({
        principal: mockSnsCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      })
    );
  });

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
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
    });

    it("should be ckBTC inside ckBTC universe", () => {
      const $store = get(isCkBTCUniverseStore);

      expect($store).toEqual(true);
    });

    it("should not be ckBTC on unsupported path", () => {
      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });
      expect(get(isCkBTCUniverseStore)).toEqual(true);

      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Neurons,
      });
      expect(get(isCkBTCUniverseStore)).toEqual(false);
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

  describe("selectedUniverseIdStore", () => {
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

    it.skip("returns OWN_CANISTER_ID if context is not a selectable universe", () => {
      const unselectableUniverse = Principal.fromText(
        "fzm72-3zdem-rsgiz-cgirs-gmy"
      );
      const $store1 = get(selectedUniverseIdStore);

      expect($store1).toEqual(OWN_CANISTER_ID);

      page.mock({ data: { universe: unselectableUniverse.toText() } });

      const $store2 = get(selectedUniverseIdStore);
      expect($store2.toText()).toEqual(OWN_CANISTER_ID.toText());
    });
  });

  describe("selectedUniverseStore", () => {
    beforeEach(() => {
      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
        mockProjectSubscribe([mockSnsFullProject])
      );

      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);

      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    });

    it("should be NNS per default", () => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

      const $store = get(selectedUniverseStore);

      expect($store).toEqual(NNS_UNIVERSE);
    });

    it("should get sns project", () => {
      const $store1 = get(selectedUniverseStore);

      expect($store1).toEqual(NNS_UNIVERSE);

      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
      });

      const $store2 = get(selectedUniverseStore);
      expect($store2).toEqual({
        canisterId: mockSnsFullProject.rootCanisterId.toText(),
        summary: mockSnsFullProject.summary,
      });
    });

    it("should get ckBTC", () => {
      const $store1 = get(selectedUniverseStore);

      expect($store1).toEqual(NNS_UNIVERSE);

      page.mock({
        data: {
          universe: CKBTC_UNIVERSE_CANISTER_ID.toText(),
        },
        routeId: AppPath.Accounts,
      });

      const $store2 = get(selectedUniverseStore);
      expect($store2).toEqual({
        canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
      });
    });
  });

  describe("in ckBTC universe", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
      page.mock({
        data: {
          universe: CKBTC_UNIVERSE_CANISTER_ID.toText(),
        },
        routeId: AppPath.Accounts,
      });
    });

    it("returns CKBTC_UNIVERSE_CANISTER_ID", () => {
      expect(get(selectedUniverseIdStore)).toEqual(CKBTC_UNIVERSE_CANISTER_ID);
    });

    it("returns OWN_CANISTER_ID if universe is ckBTC but flag disabled", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
      expect(get(selectedUniverseIdStore)).toEqual(OWN_CANISTER_ID);
    });

    it("returns OWN_CANISTER_ID if universe is ckBTC but path not supported", () => {
      page.mock({
        data: {
          universe: CKBTC_UNIVERSE_CANISTER_ID.toText(),
        },
        routeId: AppPath.Neurons,
      });
      expect(get(selectedUniverseIdStore)).toEqual(OWN_CANISTER_ID);
    });
  });

  describe("selectedCkBTCUniverseIdStore", () => {
    beforeEach(() => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Accounts,
      });
    });

    it("should get undefined", () => {
      const $store = get(selectedCkBTCUniverseIdStore);

      expect($store).toBeUndefined();
    });

    it("should get ckbtc universe id", () => {
      const $store1 = get(selectedCkBTCUniverseIdStore);

      expect($store1).toBeUndefined();

      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });

      const $store2 = get(selectedCkBTCUniverseIdStore);
      expect($store2.toText()).toEqual(CKBTC_UNIVERSE_CANISTER_ID.toText());
    });
  });
});
