import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { ckBTCUniverseStore } from "$lib/derived/ckbtc-universe.derived";
import { updateBalance } from "$lib/services/ckbtc-minter.services";
import { uncertifiedLoadSnsesAccountsBalances } from "$lib/services/sns-accounts-balance.services";
import { uncertifiedLoadAccountsBalance } from "$lib/services/wallet-uncertified-accounts.services";
import { defaultIcrcCanistersStore } from "$lib/stores/default-icrc-canisters.store";
import {
  BalanceFetchTracker,
  balanceLoader,
} from "$lib/utils/accounts-balance.utils";
import {
  createMockSnsFullProject,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import type { CanisterIdString } from "@dfinity/nns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

vi.mock("$lib/services/sns-accounts-balance.services");
vi.mock("$lib/services/wallet-uncertified-accounts.services");
vi.mock("$lib/services/ckbtc-minter.services");

describe("accounts-balance utils", () => {
  describe("BalanceFetchTracker", () => {
    beforeEach(() => {
      BalanceFetchTracker.getInstance().reset();
    });

    it("should return the same instance when called multiple times", () => {
      const instance1 = BalanceFetchTracker.getInstance();
      const instance2 = BalanceFetchTracker.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should return all ids when none have been loaded", () => {
      const ids: CanisterIdString[] = [
        "rrkah-fqaaa-aaaaa-aaaaq-cai",
        "ryjl3-tyaaa-aaaaa-aaaba-cai",
      ];

      const tracker = BalanceFetchTracker.getInstance();
      const notLoadedIds = tracker.getNotLoadedIds(ids);

      expect(notLoadedIds).toEqual(ids);
    });

    it("should not return previously loaded ids", () => {
      const firstBatch: CanisterIdString[] = ["rrkah-fqaaa-aaaaa-aaaaq-cai"];
      const secondBatch: CanisterIdString[] = ["ryjl3-tyaaa-aaaaa-aaaba-cai"];

      const tracker = BalanceFetchTracker.getInstance();

      tracker.getNotLoadedIds(firstBatch);
      const notLoadedIds = tracker.getNotLoadedIds([
        ...firstBatch,
        ...secondBatch,
      ]);

      expect(notLoadedIds).toEqual(secondBatch);
    });

    it("should return empty array when all ids have been loaded", () => {
      const ids: CanisterIdString[] = [
        "rrkah-fqaaa-aaaaa-aaaaq-cai",
        "ryjl3-tyaaa-aaaaa-aaaba-cai",
      ];

      const tracker = BalanceFetchTracker.getInstance();

      tracker.getNotLoadedIds(ids);

      const notLoadedIds = tracker.getNotLoadedIds(ids);
      expect(notLoadedIds).toEqual([]);
    });

    it("should handle empty input array", () => {
      const tracker = BalanceFetchTracker.getInstance();
      const notLoadedIds = tracker.getNotLoadedIds([]);

      expect(notLoadedIds).toEqual([]);
    });

    it("should clear all tracked ids", () => {
      const ids: CanisterIdString[] = [
        "rrkah-fqaaa-aaaaa-aaaaq-cai",
        "ryjl3-tyaaa-aaaaa-aaaba-cai",
      ];

      const tracker = BalanceFetchTracker.getInstance();
      tracker.getNotLoadedIds(ids);
      tracker.reset();

      const notLoadedIds = tracker.getNotLoadedIds(ids);
      expect(notLoadedIds).toEqual(ids);
    });

    it("should allow tracking new ids after reset", () => {
      const ids: CanisterIdString[] = ["rrkah-fqaaa-aaaaa-aaaaq-cai"];
      const tracker = BalanceFetchTracker.getInstance();

      tracker.getNotLoadedIds(ids);
      tracker.reset();

      const newIds: CanisterIdString[] = ["ryjl3-tyaaa-aaaaa-aaaba-cai"];
      const notLoadedIds = tracker.getNotLoadedIds(newIds);

      expect(notLoadedIds).toEqual(newIds);
    });
  });

  describe("balanceLoader", () => {
    beforeEach(() => {
      balanceLoader.reset();
    });

    describe("loadSnsAccountsBalances", () => {
      const rootCanisterId = rootCanisterIdMock;
      const now = 1698139468000;
      const nowInSeconds = Math.round(now / 1000);

      it("should not call service if projects array is empty", async () => {
        await balanceLoader.loadSnsAccountsBalances([]);
        expect(uncertifiedLoadSnsesAccountsBalances).toHaveBeenCalledTimes(0);
      });

      it("should call service with correct parameters", async () => {
        const mockProject = createMockSnsFullProject({
          rootCanisterId,
          summaryParams: {
            lifecycle: SnsSwapLifecycle.Open,
            swapDueTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
          },
        });

        await balanceLoader.loadSnsAccountsBalances([mockProject]);

        expect(uncertifiedLoadSnsesAccountsBalances).toHaveBeenCalledWith({
          rootCanisterIds: [mockProject.rootCanisterId],
          excludeRootCanisterIds: [],
        });
      });

      it("should not reload already loaded canister IDs", async () => {
        const mockProject = createMockSnsFullProject({
          rootCanisterId,
          summaryParams: {
            lifecycle: SnsSwapLifecycle.Open,
            swapDueTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
          },
        });

        await balanceLoader.loadSnsAccountsBalances([mockProject]);
        await balanceLoader.loadSnsAccountsBalances([mockProject]);

        expect(uncertifiedLoadSnsesAccountsBalances).toHaveBeenCalledTimes(1);
      });
    });

    describe("loadCkBTCAccountsBalances", () => {
      it("should not call service if universes array is empty", async () => {
        await balanceLoader.loadCkBTCAccountsBalances([]);

        expect(updateBalance).toHaveBeenCalledTimes(0);
        expect(uncertifiedLoadAccountsBalance).toHaveBeenCalledTimes(0);
      });

      it("should call updateBalance for ckBTC universes", async () => {
        const ckBtcUniverse = get(ckBTCUniverseStore);
        await balanceLoader.loadCkBTCAccountsBalances([ckBtcUniverse]);

        expect(updateBalance).toHaveBeenCalledTimes(1);
        expect(uncertifiedLoadAccountsBalance).toHaveBeenCalledTimes(1);
        expect(uncertifiedLoadAccountsBalance).toHaveBeenCalledWith({
          universeIds: [ckBtcUniverse.canisterId],
          excludeUniverseIds: [],
        });
      });
    });

    describe("loadIcrcTokenAccounts", () => {
      it("should not call service if no canisters", async () => {
        await balanceLoader.loadIcrcTokenAccounts({});
        expect(uncertifiedLoadAccountsBalance).toHaveBeenCalledTimes(0);
      });

      it("should call service with correct parameters", async () => {
        defaultIcrcCanistersStore.setCanisters({
          ledgerCanisterId: principal(0),
          indexCanisterId: principal(1),
        });

        const mockCanister = get(defaultIcrcCanistersStore);

        await balanceLoader.loadIcrcTokenAccounts(mockCanister);

        expect(uncertifiedLoadAccountsBalance).toHaveBeenCalledTimes(1);
        expect(uncertifiedLoadAccountsBalance).toHaveBeenCalledWith({
          universeIds: Object.keys(mockCanister),
          excludeUniverseIds: [],
        });
      });
    });

    describe("loadAllBalances", () => {
      it("should call all load methods", async () => {
        const mockData = {
          snsProjects: [],
          ckBTCUniverses: [],
          icrcCanisters: {},
        };

        const spyLoadSns = vi.spyOn(balanceLoader, "loadSnsAccountsBalances");
        const spyLoadCkBTC = vi.spyOn(
          balanceLoader,
          "loadCkBTCAccountsBalances"
        );
        const spyLoadIcrc = vi.spyOn(balanceLoader, "loadIcrcTokenAccounts");

        await balanceLoader.loadAllBalances(mockData);

        expect(spyLoadSns).toHaveBeenCalledWith(mockData.snsProjects);
        expect(spyLoadSns).toHaveBeenCalledTimes(1);

        expect(spyLoadCkBTC).toHaveBeenCalledWith(mockData.ckBTCUniverses);
        expect(spyLoadCkBTC).toHaveBeenCalledTimes(1);

        expect(spyLoadIcrc).toHaveBeenCalledWith(mockData.icrcCanisters);
        expect(spyLoadIcrc).toHaveBeenCalledTimes(1);
      });
    });
  });
});
