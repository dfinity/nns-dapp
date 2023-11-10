import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { universesStore } from "$lib/derived/universes.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("universes derived stores", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetSnsProjects();
  });

  describe("ckBTC both enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
    });

    it("should return Nns, ckBTC and ckTESTBTC per default", () => {
      const store = get(universesStore);
      expect(store.length).toEqual(3);
      expect(store[0].summary).toBeUndefined();
      expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
      expect(store[1].summary).toBeUndefined();
      expect(store[1].canisterId).toEqual(CKBTC_UNIVERSE_CANISTER_ID.toText());
      expect(store[2].summary).toBeUndefined();
      expect(store[2].canisterId).toEqual(
        CKTESTBTC_UNIVERSE_CANISTER_ID.toText()
      );
    });

    it("should return Nns, ckBTC, ckTESTBTC and SNS projects", () => {
      const snsRootCanisterId = rootCanisterIdMock;
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: snsRootCanisterId,
        },
      ]);
      const store = get(universesStore);
      expect(store.length).toEqual(4);
      expect(store[3].summary).not.toBeUndefined();
      expect(store[3].canisterId).toEqual(snsRootCanisterId.toText());
    });
  });

  describe("only ckBTC enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
    });

    it("should return Nns and ckBTC", () => {
      const store = get(universesStore);
      expect(store.length).toEqual(2);
      expect(store[0].summary).toBeUndefined();
      expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
      expect(store[1].summary).toBeUndefined();
      expect(store[1].canisterId).toEqual(CKBTC_UNIVERSE_CANISTER_ID.toText());
    });
  });

  describe("ckBTC NOT enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
    });

    it("should return Nns per default", () => {
      const store = get(universesStore);
      expect(store.length).toEqual(1);
      expect(store[0].summary).toBeUndefined();
      expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
    });

    it("should return Nns and SNS projects", () => {
      const snsRootCanisterId = rootCanisterIdMock;
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: snsRootCanisterId,
        },
      ]);
      const store = get(universesStore);
      expect(store.length).toEqual(2);
      expect(store[1].summary).not.toBeUndefined();
      expect(store[1].canisterId).toEqual(snsRootCanisterId.toText());
    });

    it("should not include open SNS projects", () => {
      const snsRootCanisterId = rootCanisterIdMock;
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: snsRootCanisterId,
        },
        {
          lifecycle: SnsSwapLifecycle.Open,
          rootCanisterId: principal(2),
        },
      ]);
      const store = get(universesStore);
      expect(store.length).toEqual(2);
    });
  });
});
