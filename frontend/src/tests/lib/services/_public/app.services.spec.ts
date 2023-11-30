import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_LEDGER_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
  CKETH_INDEX_CANISTER_ID,
  CKETH_LEDGER_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { initAppPublicData } from "$lib/services/$public/app.services";
import { loadSnsProjects } from "$lib/services/$public/sns.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import { get } from "svelte/store";

vi.mock("$lib/api/icrc-ledger.api");

vi.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsProjects: vi.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("$public/app-services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    icrcCanistersStore.reset();
    tokensStore.reset();
    vi.spyOn(icrcLedgerApi, "queryIcrcToken").mockResolvedValue(mockCkETHToken);
    overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", false);
    overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
  });

  it("should init Sns", async () => {
    await initAppPublicData();

    await expect(loadSnsProjects).toHaveBeenCalledTimes(1);
  });

  describe("when ENABLE_CKETH and ENABLE_CKTESTBTC are disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", false);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
    });
    it("should not load ckETH canisters in store", async () => {
      await initAppPublicData();

      expect(get(icrcCanistersStore)).toEqual({});
    });
  });

  describe("when ENABLE_CKETH is enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", true);
    });
    it("should load ckETH canisters in store", async () => {
      await initAppPublicData();

      expect(
        get(icrcCanistersStore)[CKETH_UNIVERSE_CANISTER_ID.toText()]
      ).toEqual({
        ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
        indexCanisterId: CKETH_INDEX_CANISTER_ID,
      });
    });

    it("should load token in store", async () => {
      await initAppPublicData();

      expect(get(tokensStore)[CKETH_UNIVERSE_CANISTER_ID.toText()]).toEqual({
        token: mockCkETHToken,
        certified: false,
      });
    });
  });

  describe("when ENABLE_CKTESTBTC is enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
    });
    it("should load ckETHSEPOLIA canisters in store", async () => {
      await initAppPublicData();

      expect(
        get(icrcCanistersStore)[CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]
      ).toEqual({
        ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
        indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
      });
    });

    it("should load token in store", async () => {
      await initAppPublicData();

      expect(
        get(tokensStore)[CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]
      ).toEqual({
        token: mockCkETHToken,
        certified: false,
      });
    });
  });
});
