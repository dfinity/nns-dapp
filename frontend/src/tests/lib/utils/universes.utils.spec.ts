import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import {
  CKBTC_UNIVERSE_CANISTER_ID,
  CKTESTBTC_UNIVERSE_CANISTER_ID,
} from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import {
  createUniverse,
  isIcrcTokenUniverse,
  isNonGovernanceTokenPath,
  isUniverseCkBTC,
  isUniverseNns,
  universeLogoAlt,
} from "$lib/utils/universe.utils";
import en from "$tests/mocks/i18n.mock";
import {
  createSummary,
  mockSnsFullProject,
  mockSummary,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("universes-utils", () => {
  describe("isNonGovernanceTokenPath", () => {
    it("should support ICRC token", () => {
      expect(
        isNonGovernanceTokenPath({
          universe: "not used here",
          path: AppPath.Accounts,
        })
      ).toBeTruthy();

      expect(
        isNonGovernanceTokenPath({
          universe: "not used here",
          path: AppPath.Wallet,
        })
      ).toBeTruthy();
    });

    it("should not support ICRC Token", () => {
      expect(
        isNonGovernanceTokenPath({
          universe: "not used here",
          path: AppPath.Neurons,
        })
      ).toBe(false);

      expect(
        isNonGovernanceTokenPath({
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
          title: "Tetris",
          logo: "https://logo.png",
        })
      ).toEqual(
        `${mockSnsFullProject.summary.metadata.name} ${en.sns_launchpad.project_logo}`
      );
    });

    it("should render alt ckTESTBTC", () => {
      expect(
        universeLogoAlt({
          canisterId: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
          title: "Tetris",
          logo: "https://logo.png",
        })
      ).toEqual(en.ckbtc.test_logo);
    });

    it("should render alt ckBTC", () => {
      expect(
        universeLogoAlt({
          canisterId: CKBTC_UNIVERSE_CANISTER_ID.toText(),
          title: "Tetris",
          logo: "https://logo.png",
        })
      ).toEqual(en.ckbtc.logo);
    });

    it("should render alt NNS", () => {
      const universe = get(nnsUniverseStore);

      expect(universeLogoAlt(universe)).toEqual(en.auth.ic_logo);
    });
  });

  describe("createUniverse", () => {
    it("should create a universe from a summary", () => {
      const projectName = "Tetris";
      const logo = "https://logo.png";
      const rootCanisterId = rootCanisterIdMock;
      const summary = createSummary({
        rootCanisterId,
        projectName,
        logo,
      });

      const universe = createUniverse(summary);
      expect(universe).toEqual({
        canisterId: rootCanisterId.toText(),
        summary,
        title: projectName,
        logo,
      });
    });
  });

  describe("isIcrcTokenUniverse", () => {
    beforeEach(() => {
      icrcCanistersStore.reset();
    });

    it("should return true if universe is in ICRC Canisters store", () => {
      const universeId = principal(0);
      icrcCanistersStore.setCanisters({
        ledgerCanisterId: universeId,
        indexCanisterId: principal(1),
      });
      expect(
        isIcrcTokenUniverse({
          universeId,
          icrcCanisters: get(icrcCanistersStore),
        })
      ).toBe(true);
    });

    it("should return false if universe is not in ICRC Canisters store", () => {
      const universeId = principal(0);
      icrcCanistersStore.setCanisters({
        ledgerCanisterId: universeId,
        indexCanisterId: principal(1),
      });
      expect(
        isIcrcTokenUniverse({
          universeId: principal(2),
          icrcCanisters: get(icrcCanistersStore),
        })
      ).toBe(false);
    });

    it("should return false when ICRC Canisters store is empty", () => {
      const universeId = principal(0);
      icrcCanistersStore.reset();
      expect(
        isIcrcTokenUniverse({
          universeId,
          icrcCanisters: get(icrcCanistersStore),
        })
      ).toBe(false);
    });
  });
});
