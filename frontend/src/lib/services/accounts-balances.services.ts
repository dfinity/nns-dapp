import { syncIcrcAccountsBalances } from "$lib/services/icrc-accounts-balance.services";
import { syncSnsAccountsBalances } from "$lib/services/sns-accounts-balance.services";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import type { CanisterIdString } from "@icp-sdk/canisters/nns";
import { Principal } from "@icp-sdk/core/principal";

const loadedBalances = new Set<CanisterIdString>();
export const resetBalanceLoading = (): void => {
  loadedBalances.clear();
};

const getNotLoadedIds = (ids: CanisterIdString[]): CanisterIdString[] => {
  const notLoadedIds = ids.filter((id) => !loadedBalances.has(id));
  notLoadedIds.forEach((id) => loadedBalances.add(id));
  return notLoadedIds;
};

export const loadSnsAccountsBalances = async (
  rootCanisterIds: Principal[]
): Promise<void> => {
  const stringIds = rootCanisterIds.map((id) => id.toText());
  const notLoadedIds = getNotLoadedIds(stringIds);

  if (notLoadedIds.length === 0) return;

  await syncSnsAccountsBalances({
    rootCanisterIds: notLoadedIds.map((id) => Principal.fromText(id)),
  });
};

export const loadAccountsBalances = async (
  universeIds: UniverseCanisterIdText[]
): Promise<void> => {
  const notLoadedIds = getNotLoadedIds(universeIds);

  if (notLoadedIds.length === 0) return;

  await syncIcrcAccountsBalances({
    universeIds: notLoadedIds,
  });
};
