import { allCkTokens } from "$lib/constants/ck-canister-ids.constants";
import {
  CKETH_INDEX_CANISTER_ID,
  CKETH_UNIVERSE_CANISTER_ID,
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_LEDGER_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import {
  CKUSDC_INDEX_CANISTER_ID,
  CKUSDC_LEDGER_CANISTER_ID,
  CKUSDC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckusdc-canister-ids.constants";
import { loadIcrcCanisters } from "$lib/services/icrc-canisters.services";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { get } from "svelte/store";

describe("icrc-canisters.services", () => {
  describe("loadIcrcCanisters", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
    });

    describe("if ckethtest is enabled", () => {
      beforeEach(() => {
        overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
      });

      it("should load cketh and ckusdc canisters", async () => {
        expect(get(defaultIcrcCanistersStore)).toEqual({});
        await loadIcrcCanisters();

        expect(get(defaultIcrcCanistersStore)).toEqual({
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
          ...allCkTokens.reduce(
            (acc, { ledgerCanisterId, indexCanisterId }) => {
              acc[ledgerCanisterId.toText()] = {
                ledgerCanisterId,
                indexCanisterId,
              };
              return acc;
            },
            {}
          ),
        });
      });

      it("should not load canisters if already present", async () => {
        vi.spyOn(defaultIcrcCanistersStore, "setCanisters");
        await loadIcrcCanisters();
        expect(defaultIcrcCanistersStore.setCanisters).toHaveBeenCalledTimes(
          13
        );
        await loadIcrcCanisters();
        expect(defaultIcrcCanistersStore.setCanisters).toHaveBeenCalledTimes(
          13
        );
      });
    });

    describe("if ckethtest is disabled", () => {
      it("should load cketh and ckusdc canisters", async () => {
        expect(get(defaultIcrcCanistersStore)).toEqual({});
        await loadIcrcCanisters();

        expect(get(defaultIcrcCanistersStore)).toEqual({
          [CKETH_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKETH_UNIVERSE_CANISTER_ID,
            indexCanisterId: CKETH_INDEX_CANISTER_ID,
          },
          [CKUSDC_UNIVERSE_CANISTER_ID.toText()]: {
            ledgerCanisterId: CKUSDC_LEDGER_CANISTER_ID,
            indexCanisterId: CKUSDC_INDEX_CANISTER_ID,
          },
          ...allCkTokens.reduce(
            (acc, { ledgerCanisterId, indexCanisterId }) => {
              acc[ledgerCanisterId.toText()] = {
                ledgerCanisterId,
                indexCanisterId,
              };
              return acc;
            },
            {}
          ),
        });
      });
    });
  });
});
