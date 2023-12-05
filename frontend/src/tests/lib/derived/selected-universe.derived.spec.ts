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
  isCkBTCUniverseStore,
  isIcrcTokenUniverseStore,
  isNnsUniverseStore,
  selectedCkBTCUniverseIdStore,
  selectedIcrcTokenUniverseIdStore,
  selectedUniverseIdStore,
  selectedUniverseStore,
} from "$lib/derived/selected-universe.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { page } from "$mocks/$app/stores";
import { mockCkETHToken } from "$tests/mocks/cketh-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  principal,
} from "$tests/mocks/sns-projects.mock";
import {
  mockSnsCanisterId,
  mockSnsCanisterIdText,
} from "$tests/mocks/sns.api.mock";
import { ckBTCUniverseMock, nnsUniverseMock } from "$tests/mocks/universe.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("selected universe derived stores", () => {
  beforeEach(() => {
    overrideFeatureFlagsStore.reset();
    setSnsProjects([
      {
        rootCanisterId: mockSnsCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
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

  describe("isIcrcTokenUniverseStore", () => {
    const ledgerCanisterId = principal(0);

    beforeEach(() => {
      icrcCanistersStore.reset();
    });

    it("should be ICRC Token inside ICRC Token universe", () => {
      page.mock({
        data: { universe: ledgerCanisterId.toText() },
        routeId: AppPath.Accounts,
      });
      icrcCanistersStore.setCanisters({
        ledgerCanisterId,
        indexCanisterId: principal(1),
      });

      expect(get(isIcrcTokenUniverseStore)).toEqual(true);
    });

    it("should not be ICRC Token on unsupported path", () => {
      page.mock({
        data: { universe: ledgerCanisterId.toText() },
        routeId: AppPath.Neurons,
      });
      icrcCanistersStore.setCanisters({
        ledgerCanisterId,
        indexCanisterId: principal(1),
      });

      expect(get(isIcrcTokenUniverseStore)).toEqual(false);
    });

    it("should not be ICRC Token outside ckBTC universe", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });

      expect(get(isIcrcTokenUniverseStore)).toEqual(false);
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

    const ckBTCTestData = [
      {
        universeName: "ckBTC",
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        expectedUniverseName: "ckBTC",
        expectedUniverseId: CKBTC_UNIVERSE_CANISTER_ID,
        routeId: AppPath.Accounts,
      },
      {
        universeName: "ckBTC",
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        expectedUniverseName: "ckBTC",
        expectedUniverseId: CKBTC_UNIVERSE_CANISTER_ID,
        routeId: AppPath.Wallet,
      },
      {
        universeName: "ckBTC",
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        expectedUniverseName: "NNS",
        expectedUniverseId: OWN_CANISTER_ID,
        routeId: AppPath.Neurons,
      },
      {
        universeName: "ckBTC",
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
        expectedUniverseName: "NNS",
        expectedUniverseId: OWN_CANISTER_ID,
        routeId: AppPath.Proposals,
      },
    ];

    ckBTCTestData.forEach((data) => {
      it(`should return ${data.expectedUniverseName} universe id for ${data.universeName} in ${data.routeId} page`, () => {
        page.mock({
          data: {
            universe: data.universeId.toText(),
          },
          routeId: data.routeId,
        });

        expect(get(selectedUniverseIdStore).toText()).toEqual(
          data.expectedUniverseId.toText()
        );
      });
    });

    const icrcCanisterId = principal(0);
    const IcrcTokenTestData = [
      {
        universeName: "IcrcToken",
        universeId: icrcCanisterId,
        expectedUniverseName: "IcrcToken",
        expectedUniverseId: icrcCanisterId,
        routeId: AppPath.Accounts,
      },
      {
        universeName: "IcrcToken",
        universeId: icrcCanisterId,
        expectedUniverseName: "IcrcToken",
        expectedUniverseId: icrcCanisterId,
        routeId: AppPath.Wallet,
      },
      {
        universeName: "IcrcToken",
        universeId: icrcCanisterId,
        expectedUniverseName: "NNS",
        expectedUniverseId: OWN_CANISTER_ID,
        routeId: AppPath.Neurons,
      },
      {
        universeName: "IcrcToken",
        universeId: icrcCanisterId,
        expectedUniverseName: "NNS",
        expectedUniverseId: OWN_CANISTER_ID,
        routeId: AppPath.Proposals,
      },
    ];

    IcrcTokenTestData.forEach((data) => {
      it(`should return ${data.expectedUniverseName} universe id for ${data.universeName} in ${data.routeId} page`, () => {
        page.mock({
          data: {
            universe: data.universeId.toText(),
          },
          routeId: data.routeId,
        });
        icrcCanistersStore.setCanisters({
          ledgerCanisterId: icrcCanisterId,
          indexCanisterId: principal(1),
        });

        expect(get(selectedUniverseIdStore).toText()).toEqual(
          data.expectedUniverseId.toText()
        );
      });
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

      expect($store).toEqual(nnsUniverseMock);
    });

    it("should get sns project", () => {
      const $store1 = get(selectedUniverseStore);

      expect($store1).toEqual(nnsUniverseMock);

      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
      });

      const $store2 = get(selectedUniverseStore);
      expect($store2).toEqual({
        canisterId: mockSnsFullProject.rootCanisterId.toText(),
        summary: mockSnsFullProject.summary,
        title: mockSnsFullProject.summary.metadata.name,
        logo: mockSnsFullProject.summary.metadata.logo,
      });
    });

    it("should get ckBTC", () => {
      const $store1 = get(selectedUniverseStore);

      expect($store1).toEqual(nnsUniverseMock);

      page.mock({
        data: {
          universe: CKBTC_UNIVERSE_CANISTER_ID.toText(),
        },
        routeId: AppPath.Accounts,
      });

      const $store2 = get(selectedUniverseStore);
      expect($store2).toEqual(ckBTCUniverseMock);
    });
  });

  describe("in ckBTC universe", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
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

    it("returns OWN_CANISTER_ID if universe is ckBTC but flags disabled", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
      expect(get(selectedUniverseIdStore)).toEqual(OWN_CANISTER_ID);
    });

    it("returns OWN_CANISTER_ID if universe is ckBTC but flag disabled, even with ckTESTBTC enabled", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
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

  describe("in ckTESTBTC universe", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", true);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", false);
      page.mock({
        data: {
          universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
        },
        routeId: AppPath.Accounts,
      });
    });

    it("returns CKTESTBTC_UNIVERSE_CANISTER_ID", () => {
      expect(get(selectedUniverseIdStore)).toEqual(
        CKTESTBTC_UNIVERSE_CANISTER_ID
      );
    });

    it("returns OWN_CANISTER_ID if universe is ckTESTBTC but flag disabled", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
      expect(get(selectedUniverseIdStore)).toEqual(OWN_CANISTER_ID);
    });

    it("returns OWN_CANISTER_ID if universe is ckTESTBTC but flag disabled, even with ckBTC enabled", () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_CKTESTBTC", false);
      overrideFeatureFlagsStore.setFlag("ENABLE_CKBTC", true);
      expect(get(selectedUniverseIdStore)).toEqual(OWN_CANISTER_ID);
    });

    it("returns OWN_CANISTER_ID if universe is ckBTC but path not supported", () => {
      page.mock({
        data: {
          universe: CKTESTBTC_UNIVERSE_CANISTER_ID.toText(),
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

  describe("selectedIcrcTokenUniverseIdStore", () => {
    const ledgerCanisterId = principal(0);

    beforeEach(() => {
      icrcCanistersStore.reset();
      tokensStore.reset();
      icrcCanistersStore.setCanisters({
        ledgerCanisterId,
        indexCanisterId: principal(1),
      });
      tokensStore.setTokens({
        [ledgerCanisterId.toText()]: {
          certified: true,
          token: mockCkETHToken,
        },
      });
    });
    it("should get undefined for NNS", () => {
      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Accounts,
      });

      expect(get(selectedIcrcTokenUniverseIdStore)).toBeUndefined();
    });

    it("should get undefined for ckBTC", () => {
      page.mock({
        data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Accounts,
      });
      expect(get(selectedIcrcTokenUniverseIdStore)).toBeUndefined();
    });

    it("should get ICRC token universe id in Accounts", () => {
      page.mock({
        data: { universe: ledgerCanisterId.toText() },
        routeId: AppPath.Accounts,
      });

      expect(get(selectedIcrcTokenUniverseIdStore)?.toText()).toBe(
        ledgerCanisterId.toText()
      );
    });

    it("should get ICRC token universe id in Wallet", () => {
      page.mock({
        data: { universe: ledgerCanisterId.toText() },
        routeId: AppPath.Wallet,
      });

      expect(get(selectedIcrcTokenUniverseIdStore)?.toText()).toBe(
        ledgerCanisterId.toText()
      );
    });

    it("should return undefined when universe changes", () => {
      page.mock({
        data: { universe: ledgerCanisterId.toText() },
        routeId: AppPath.Accounts,
      });

      expect(get(selectedIcrcTokenUniverseIdStore)?.toText()).toBe(
        ledgerCanisterId.toText()
      );

      page.mock({
        data: { universe: OWN_CANISTER_ID_TEXT },
        routeId: AppPath.Accounts,
      });

      expect(get(selectedIcrcTokenUniverseIdStore)).toBeUndefined();
    });

    it("should return undefined if not in Accounts or Wallet page", () => {
      page.mock({
        data: { universe: ledgerCanisterId.toText() },
        routeId: AppPath.Neurons,
      });

      expect(get(selectedIcrcTokenUniverseIdStore)).toBeUndefined();
    });
  });
});
