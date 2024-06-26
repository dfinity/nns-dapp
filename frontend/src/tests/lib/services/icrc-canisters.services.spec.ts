import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_LEDGER_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
  CKETH_INDEX_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import {
  CKUSDC_INDEX_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckusdc-canister-ids.constants";
import { loadIcrcCanisters } from "$lib/services/icrc-canisters.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { get } from "svelte/store";

describe("icrc-canisters.services", () => {
  describe("loadIcrcCanisters", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
      icrcCanistersStore.reset();
    });

    describe("if ckethtest is enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
      });

      it("should load cketh and ckusdc canisters", async () => {
        expect(get(icrcCanistersStore)).toEqual({});
        await loadIcrcCanisters();

        expect(get(icrcCanistersStore)).toEqual({
          [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
            indexCanisterId: CKETH_INDEX_CANISTER_ID,
          },
          [CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
            indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
          },
          [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
            indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
          },
        });
      });

      it("should not load canisters if already present", async () => {
        vi.spyOn(icrcCanistersStore, "setCanisters");
        icrcCanistersStore.setCanisters({
          ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
          indexCanisterId: CKETH_INDEX_CANISTER_ID,
        });
        icrcCanistersStore.setCanisters({
          ledgerCanisterId: CKETHSEPOLIA_LEDGER_CANISTER_ID,
          indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
        });
        icrcCanistersStore.setCanisters({
          ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
          indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
        });
        expect(icrcCanistersStore.setCanisters).toHaveBeenCalledTimes(3);
        await loadIcrcCanisters();
        expect(icrcCanistersStore.setCanisters).toHaveBeenCalledTimes(3);
      });
    });

    describe("if ckethtest is disabled", () => {
      it("should load cketh and ckusdc canisters", async () => {
        expect(get(icrcCanistersStore)).toEqual({});
        await loadIcrcCanisters();

        expect(get(icrcCanistersStore)).toEqual({
          [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
            indexCanisterId: CKETH_INDEX_CANISTER_ID,
          },
          [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
            indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
          },
        });
      });
    });
  });
});
