import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_LEDGER_CANISTER_ID,
  CKETH_INDEX_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { universesStore } from "$lib/derived/universes.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { aggregatorCanisterLogoPath } from "$lib/utils/sns-aggregator-converters.utils";
import {
  mockCkETHTESTToken,
  mockCkETHToken,
} from "$tests/mocks/cketh-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import {
  ckBTCUniverseMock,
  ckETHSEPOLIAUniverseMock,
  ckETHUniverseMock,
  ckTESTBTCUniverseMock,
  nnsUniverseMock,
} from "$tests/mocks/universe.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("universes derived stores", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetSnsProjects();
    icrcCanistersStore.reset();
    tokensStore.reset();
  });

  describe("ckBTC both enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
    });

    it("should return Nns, ckBTC and ckTESTBTC per default", () => {
      const store = get(universesStore);
      expect(store.length).toEqual(3);
      expect(store[0]).toEqual(nnsUniverseMock);
      expect(store[1]).toEqual(ckBTCUniverseMock);
      expect(store[2]).toEqual(ckTESTBTCUniverseMock);
    });

    it("should return Nns, ckBTC, ckTESTBTC and SNS projects", () => {
      const snsRootCanisterId = rootCanisterIdMock;
      const projectName = "Tetris";
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: snsRootCanisterId,
          projectName,
        },
      ]);
      const store = get(universesStore);
      expect(store.length).toEqual(4);
      expect(store[3].summary).not.toBeUndefined();
      expect(store[3].canisterId).toEqual(snsRootCanisterId.toText());
      expect(store[3].title).toBe(projectName);
      expect(store[3].logo).toBe(
        aggregatorCanisterLogoPath(snsRootCanisterId.toText())
      );
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

    it("should return Nns, ckBTC and ckETH", () => {
      icrcCanistersStore.setCanisters({
        ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
        indexCanisterId: CKETH_INDEX_CANISTER_ID,
      });
      tokensStore.setTokens({
        [CKETH_LEDGER_CANISTER_ID.toText()]: {
          certified: true,
          token: mockCkETHToken,
        },
      });
      const store = get(universesStore);
      expect(store.length).toEqual(3);
      expect(store[0].summary).toBeUndefined();
      expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
      expect(store[1].summary).toBeUndefined();
      expect(store[1].canisterId).toEqual(CKBTC_UNIVERSE_CANISTER_ID.toText());
      expect(store[2]).toEqual(ckETHUniverseMock);
    });

    // TODO: GIX-2137 Enable when we have the ckETH canister ids in env vars
    it.skip("should return Nns, ckBTC, ckETH and ckETHSEPOLIA", () => {
      icrcCanistersStore.setCanisters({
        ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
        indexCanisterId: CKETH_INDEX_CANISTER_ID,
      });
      icrcCanistersStore.setCanisters({
        ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
        indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
      });
      tokensStore.setTokens({
        [CKETH_LEDGER_CANISTER_ID.toText()]: {
          certified: true,
          token: mockCkETHToken,
        },
        [CKETHSEPOLIA_LEDGER_CANISTER_ID.toText()]: {
          certified: true,
          token: mockCkETHTESTToken,
        },
      });
      const store = get(universesStore);
      expect(store.length).toEqual(4);
      expect(store[0].summary).toBeUndefined();
      expect(store[0].canisterId).toEqual(OWN_CANISTER_ID.toText());
      expect(store[1].summary).toBeUndefined();
      expect(store[1].canisterId).toEqual(CKBTC_UNIVERSE_CANISTER_ID.toText());
      expect(store[2]).toEqual(ckETHUniverseMock);
      expect(store[3]).toEqual(ckETHSEPOLIAUniverseMock);
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
