import {
  OWN_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  isUniverseCkBTC,
  isUniverseNns,
  pathSupportsCkBTC,
  universeLogoAlt,
} from "$lib/utils/universe.utils";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsFullProject,
  mockSummary,
} from "$tests/mocks/sns-projects.mock";
import { Principal } from "@dfinity/principal";

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
      ).toBe(false);

      expect(
        pathSupportsCkBTC({
          universe: "not used here",
          path: AppPath.Proposal,
        })
      ).toBe(false);
    });
  });

  describe("isUniverseNns", () => {
    it("returns true if nns dapp principal", () => {
      expect(isUniverseNns(OWN_CANISTER_ID)).toBeTruthy();
    });

    it("returns true if nns dapp principal", () => {
      expect(isUniverseNns(Principal.from("aaaaa-aa"))).toBe(false);
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
      expect(isUniverseCkBTC(OWN_CANISTER_ID)).toBe(false);
    });

    it("returns false if not ckBTC canister id text", () => {
      expect(isUniverseCkBTC(OWN_CANISTER_ID.toText())).toBe(false);
    });
  });

  describe("universeLogoAlt", () => {
    it("should render alt sns", () => {
      expect(
        universeLogoAlt({
          summary: mockSummary,
          canisterId: mockSnsFullProject.rootCanisterId.toText(),
        })
      ).toEqual(
        `${mockSnsFullProject.summary.metadata.name} ${en.sns_launchpad.project_logo}`
      );
    });

    it("should render alt ckTESTBTC", () => {
      expect(
        universeLogoAlt({ canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID.toText() })
      ).toEqual(en.ckbtc.test_logo);
    });

    it("should render alt ckBTC", () => {
      expect(
        universeLogoAlt({ canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText() })
      ).toEqual(en.ckbtc.logo);
    });

    it("should render alt NNS", () => {
      expect(universeLogoAlt({ canisterId: OWN_CANISTER_ID_TEXT })).toEqual(
        en.auth.ic_logo
      );
    });
  });
});
