import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  isUniverseCkBTC,
  isUniverseNns,
  pathSupportsCkBTC,
} from "$lib/utils/universe.utils";
import { Principal } from "@dfinity/principal";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "../../../lib/constants/ckbtc-canister-ids.constants";

describe("universes-utils", () => {
  describe("pathSupportsCkBTC", () => {
    it("should support ckBTC", () => {
      expect(
        pathSupportsCkBTC({
          universe: "not used here",
          path: AppPath.Accounts,
        })
      ).toBeTruthy();

      expect(
        pathSupportsCkBTC({
          universe: "not used here",
          path: AppPath.Wallet,
        })
      ).toBeTruthy();
    });

    it("should not support ckBTC", () => {
      expect(
        pathSupportsCkBTC({
          universe: "not used here",
          path: AppPath.Neurons,
        })
      ).toBeFalsy();

      expect(
        pathSupportsCkBTC({
          universe: "not used here",
          path: AppPath.Proposal,
        })
      ).toBeFalsy();
    });
  });

  describe("isUniverseNns", () => {
    it("returns true if nns dapp principal", () => {
      expect(isUniverseNns(OWN_CANISTER_ID)).toBeTruthy();
    });

    it("returns true if nns dapp principal", () => {
      expect(isUniverseNns(Principal.from("aaaaa-aa"))).toBeFalsy();
    });
  });

  describe("isUniverseCkBTC", () => {
    it("returns true if ckBTC canister id", () => {
      expect(isUniverseCkBTC(CKBTC_UNIVERSE_CANISTER_ID)).toBeTruthy();
      expect(isUniverseCkBTC(CKTESTBTC_UNIVERSE_CANISTER_ID)).toBeTruthy();
    });

    it("returns true if ckBTC canister id text", () => {
      expect(isUniverseCkBTC(CKBTC_UNIVERSE_CANISTER_ID.toText())).toBeTruthy();
      expect(
        isUniverseCkBTC(CKTESTBTC_UNIVERSE_CANISTER_ID.toText())
      ).toBeTruthy();
    });

    it("returns false if not ckBTC canister id", () => {
      expect(isUniverseCkBTC(OWN_CANISTER_ID)).toBeFalsy();
    });

    it("returns false if not ckBTC canister id text", () => {
      expect(isUniverseCkBTC(OWN_CANISTER_ID.toText())).toBeFalsy();
    });
  });
});
