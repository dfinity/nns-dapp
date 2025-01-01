import { CKBTC_ADDITIONAL_CANISTERS } from "$lib/constants/ckbtc-additional-canister-ids.constants";
import type { IcrcCanistersStoreData } from "$lib/derived/icrc-canisters.derived";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import { updateBalance } from "$lib/services/ckbtc-minter.services";
import { uncertifiedLoadSnsesAccountsBalances } from "$lib/services/sns-accounts-balance.services";
import { uncertifiedLoadAccountsBalance } from "$lib/services/wallet-uncertified-accounts.services";
import type { Universe } from "$lib/types/universe";
import { isArrayEmpty } from "$lib/utils/utils";
import type { CanisterIdString } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { nonNullish } from "@dfinity/utils";

class BalanceFetchTracker {
  private static instance: BalanceFetchTracker;
  private loadedBalances: Set<CanisterIdString> = new Set();

  public static getInstance(): BalanceFetchTracker {
    if (!this.instance) this.instance = new BalanceFetchTracker();

    return this.instance;
  }

  public getNotLoadedIds(ids: CanisterIdString[]): CanisterIdString[] {
    const notLoadedIds = ids.filter((id) => !this.loadedBalances.has(id));
    notLoadedIds.forEach((id) => this.loadedBalances.add(id));
    return notLoadedIds;
  }

  public reset(): void {
    this.loadedBalances.clear();
  }
}

export const balanceLoader = {
  reset() {
    BalanceFetchTracker.getInstance().reset();
  },
  async loadAllBalances({
    snsProjects,
    ckBTCUniverses,
    icrcCanisters,
  }: {
    snsProjects: SnsFullProject[];
    ckBTCUniverses: Universe[];
    icrcCanisters: IcrcCanistersStoreData;
  }) {
    await Promise.all([
      this.loadSnsAccountsBalances(snsProjects),
      this.loadCkBTCAccountsBalances(ckBTCUniverses),
      this.loadIcrcTokenAccounts(icrcCanisters),
    ]);
  },

  async loadSnsAccountsBalances(projects: SnsFullProject[]) {
    if (projects.length === 0) return;

    const rootCanisterIds = projects.map(({ rootCanisterId }) =>
      rootCanisterId.toText()
    );
    const notLoadedCanisterIds =
      BalanceFetchTracker.getInstance().getNotLoadedIds(rootCanisterIds);

    if (notLoadedCanisterIds.length === 0) return;

    await uncertifiedLoadSnsesAccountsBalances({
      rootCanisterIds: notLoadedCanisterIds.map((id) => Principal.fromText(id)),
      excludeRootCanisterIds: [],
    });
  },

  async loadCkBTCAccountsBalances(universes: Universe[]) {
    const canisterIds = universes.map((universe) => universe.canisterId);
    const notLoadedCanisterIds =
      BalanceFetchTracker.getInstance().getNotLoadedIds(canisterIds);

    if (notLoadedCanisterIds.length === 0) return;

    /**
     * Calling updateBalance because users are confused about when and how to call it and product required to add this additional call within this process.
     * That way, when user navigates to the Tokens page, the call is also triggered.
     *
     * There is also a "Check for incoming BTC" button in the Wallet page.
     */
    universes.forEach((universe) => {
      if (!notLoadedCanisterIds.includes(universe.canisterId)) return;

      const ckBTCCanisters = CKBTC_ADDITIONAL_CANISTERS[universe.canisterId];
      if (nonNullish(ckBTCCanisters.minterCanisterId)) {
        updateBalance({
          universeId: Principal.fromText(universe.canisterId),
          minterCanisterId: ckBTCCanisters.minterCanisterId,
          reload: () => this.loadAccountsBalances([universe.canisterId]),
          deferReload: false,
          uiIndicators: false,
        });
      }
    });

    await this.loadAccountsBalances(
      universes.map(({ canisterId }) => canisterId)
    );
  },

  async loadIcrcTokenAccounts(icrcCanisters: IcrcCanistersStoreData) {
    const ids = Object.keys(icrcCanisters);
    const notLoadedCanisterIds =
      BalanceFetchTracker.getInstance().getNotLoadedIds(ids);

    if (notLoadedCanisterIds.length === 0) return;

    await this.loadAccountsBalances(notLoadedCanisterIds);
  },

  async loadAccountsBalances(universeIds: CanisterIdString[]) {
    if (isArrayEmpty(universeIds)) return;

    await uncertifiedLoadAccountsBalance({
      universeIds,
      excludeUniverseIds: [],
    });
  },
};
