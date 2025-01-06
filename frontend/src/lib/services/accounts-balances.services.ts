import { uncertifiedLoadSnsesAccountsBalances } from "$lib/services/sns-accounts-balance.services";
import { uncertifiedLoadAccountsBalance } from "$lib/services/wallet-uncertified-accounts.services";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { isArrayEmpty } from "$lib/utils/utils";
import type { CanisterIdString } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";

const loadedBalances = new Set<CanisterIdString>();
export const resetBalanceLoading = (): void => {
  loadedBalances.clear();
};

export const getNotLoadedIds = (
  ids: CanisterIdString[]
): CanisterIdString[] => {
  const notLoadedIds = ids.filter((id) => !loadedBalances.has(id));
  notLoadedIds.forEach((id) => loadedBalances.add(id));
  return notLoadedIds;
};

export const loadSnsBalances = async (
  rootCanisterIds: Principal[]
): Promise<void> => {
  if (rootCanisterIds.length === 0) return;

  const stringIds = rootCanisterIds.map((id) => id.toText());
  const notLoadedIds = getNotLoadedIds(stringIds);

  if (notLoadedIds.length === 0) return;

  await uncertifiedLoadSnsesAccountsBalances({
    rootCanisterIds: notLoadedIds.map((id) => Principal.fromText(id)),
    excludeRootCanisterIds: [],
  });
};

export const loadAccountsBalances = async (
  universeIds: UniverseCanisterIdText[]
): Promise<void> => {
  if (isArrayEmpty(universeIds)) return;

  const notLoadedIds = getNotLoadedIds(universeIds);

  if (notLoadedIds.length === 0) return;

  await uncertifiedLoadAccountsBalance({
    universeIds: notLoadedIds,
    excludeUniverseIds: [],
  });
};
