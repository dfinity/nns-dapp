import {
  CKETHTEST_UNIVERSE_CANISTER_ID,
  CKETH_INDEX_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
  CKTESTETH_INDEX_CANISTER_ID,
  CKTESTETH_LEDGER_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { loadCkETHCanisters } from "$lib/services/cketh-canisters.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { get } from "svelte/store";

describe("cketh-canisters.services", () => {
  describe("loadCkETHCanisters", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", false);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
      icrcCanistersStore.reset();
    });

    describe("if cketh is enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKETH", true);
      });

      it("should load cketh canisters", async () => {
        expect(get(icrcCanistersStore)).toEqual({});
        await loadCkETHCanisters();

        expect(get(icrcCanistersStore)).toEqual({
          [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
            indexCanisterId: CKETH_INDEX_CANISTER_ID,
          },
        });
      });

      it("should load ckethtest canisters if cktestbtc is enabled", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);

        expect(get(icrcCanistersStore)).toEqual({});
        await loadCkETHCanisters();

        expect(get(icrcCanistersStore)).toEqual({
          [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
            indexCanisterId: CKETH_INDEX_CANISTER_ID,
          },
          [CKETHTEST_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKTESTETH_LEDGER_CANISTER_ID,
            indexCanisterId: CKTESTETH_INDEX_CANISTER_ID,
          },
        });
      });
    });
  });
});
