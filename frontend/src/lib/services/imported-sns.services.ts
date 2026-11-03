import { queryIcrcMintingAccount } from "$lib/api/icrc-ledger.api";
import {
  queryCanistersControllers,
  querySnsCanisterIds,
  querySnsGovernanceData,
  querySnsGovernanceMode,
  querySnsLedgerData,
  querySnsTopics,
} from "$lib/api/imported-sns.api";
import { MAX_IMPORTED_SNSES } from "$lib/constants/imported-snses.constants";
import { authSignedInStore } from "$lib/derived/auth.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { loadActionableProposalsForSns } from "$lib/services/actionable-sns-proposals.services";
import {
  actionableSnsProposalsStore,
  failedActionableSnsesStore,
} from "$lib/stores/actionable-sns-proposals.store";
import {
  importedSnsesStore,
  loadedImportedSnsesStore,
} from "$lib/stores/imported-snses.store";
import {
  importedSnsRootCanisterIdsStore,
  snsAggregatorIncludingAbortedProjectsStore,
} from "$lib/stores/sns-aggregator.store";
import { toastsError } from "$lib/stores/toasts.store";
import { ImportedSnsError } from "$lib/types/imported-sns.errors";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { isMethodNotFoundError } from "$lib/utils/error.utils";
import {
  toCachedSnsDto,
  type ImportedSnsCanisterIds,
} from "$lib/utils/imported-sns.utils";
import { registerCleanupForTesting } from "$lib/utils/test-support.utils";
import { fromNullable, isNullish, nonNullish } from "@dfinity/utils";
import { AnonymousIdentity, type Identity } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { get } from "svelte/store";

// The value of `Mode::Normal` in SNS governance.
const GOVERNANCE_MODE_NORMAL = 1;

const getSnsCanisterIds = async ({
  identity,
  rootCanisterId,
}: {
  identity: Identity;
  rootCanisterId: Principal;
}): Promise<ImportedSnsCanisterIds> => {
  const response = await querySnsCanisterIds({
    identity,
    rootCanisterId,
    certified: false,
  }).catch((error) => {
    // The canister is not an SNS root canister.
    if (isMethodNotFoundError(error)) {
      throw new ImportedSnsError("missing-canisters");
    }
    throw error;
  });
  const governance = fromNullable(response.governance);
  const ledger = fromNullable(response.ledger);
  const swap = fromNullable(response.swap);
  const index = fromNullable(response.index);

  if (
    isNullish(governance) ||
    isNullish(ledger) ||
    isNullish(swap) ||
    isNullish(index)
  ) {
    throw new ImportedSnsError("missing-canisters");
  }

  return {
    root: rootCanisterId,
    governance,
    ledger,
    swap,
    index,
    dapps: response.dapps,
    archives: response.archives,
  };
};

const includesPrincipal = (principals: Principal[], principal: Principal) =>
  principals.some((p) => p.toText() === principal.toText());

const isDefaultSubaccount = (subaccount: Uint8Array | number[] | undefined) =>
  isNullish(subaccount) || subaccount.every((byte) => byte === 0);

/**
 * Throws an `ImportedSnsError` if the canisters are not linked like the canisters of an SNS.
 *
 * Without these checks, a root canister could list a real ledger, for example
 * the ICP ledger, together with a governance canister that someone else controls.
 */
const assertSnsCanisters = async ({
  identity,
  canisterIds: { root, governance, ledger, index },
}: {
  identity: Identity;
  canisterIds: ImportedSnsCanisterIds;
}): Promise<void> => {
  const [
    governanceControllers,
    rootControllers,
    ledgerControllers,
    indexControllers,
  ] = await queryCanistersControllers({
    identity,
    canisterIds: [governance, root, ledger, index],
  });

  if (
    !includesPrincipal(governanceControllers, root) ||
    !includesPrincipal(rootControllers, governance) ||
    !includesPrincipal(ledgerControllers, root) ||
    !includesPrincipal(indexControllers, root)
  ) {
    throw new ImportedSnsError("controllers");
  }

  // The controllers check passed, so the ledger and governance are canisters of the SNS.
  const [mintingAccount, { mode }] = await Promise.all([
    queryIcrcMintingAccount({ identity, canisterId: ledger, certified: false }),
    querySnsGovernanceMode({ identity, governanceCanisterId: governance }),
  ]);

  // SNS governance mints and burns with its default account.
  if (
    isNullish(mintingAccount) ||
    mintingAccount.owner.toText() !== governance.toText() ||
    !isDefaultSubaccount(mintingAccount.subaccount)
  ) {
    throw new ImportedSnsError("minting-account");
  }

  // In `PreInitializationSwap` mode, governance rejects new neurons from users.
  // The stake flow would then leave the tokens in the staking subaccount.
  if (fromNullable(mode) !== GOVERNANCE_MODE_NORMAL) {
    throw new ImportedSnsError("governance-mode");
  }
};

/**
 * Loads an SNS that the aggregator does not list, and converts it to the format of the aggregator.
 *
 * Throws an `ImportedSnsError` if the SNS fails one of the checks.
 */
export const getImportedSns = async (
  rootCanisterId: Principal
): Promise<CachedSnsDto> => {
  // The data is public, and the user can be signed out.
  const identity = new AnonymousIdentity();
  const canisterIds = await getSnsCanisterIds({ identity, rootCanisterId });

  // The controllers come from the certified state, so the other calls can be queries.
  await assertSnsCanisters({ identity, canisterIds });

  const [governanceData, topics, ledgerData] = await Promise.all([
    querySnsGovernanceData({
      identity,
      governanceCanisterId: canisterIds.governance,
      certified: false,
    }),
    // Older SNS versions do not have `list_topics`.
    querySnsTopics({
      identity,
      governanceCanisterId: canisterIds.governance,
      certified: false,
    }).catch((error: unknown) => {
      if (isMethodNotFoundError(error)) return undefined;
      throw error;
    }),
    querySnsLedgerData({
      identity,
      ledgerCanisterId: canisterIds.ledger,
      certified: false,
    }),
  ]);

  return toCachedSnsDto({
    canisterIds,
    ...governanceData,
    topics,
    tokenMetadata: ledgerData.metadata,
    fee: ledgerData.fee,
    totalSupply: ledgerData.totalSupply,
  });
};

// The load of the current list of imported root canister IDs.
let currentLoad: { key: string; promise: Promise<void> } | undefined;

registerCleanupForTesting(() => {
  currentLoad = undefined;
});

const loadSnses = async (
  rootCanisterIds: RootCanisterIdText[]
): Promise<{
  snses: CachedSnsDto[];
  failures: { rootCanisterId: RootCanisterIdText; err: unknown }[];
}> => {
  const results = await Promise.allSettled(
    rootCanisterIds.map(async (rootCanisterId) =>
      getImportedSns(Principal.fromText(rootCanisterId))
    )
  );

  const snses: CachedSnsDto[] = [];
  const failures: { rootCanisterId: RootCanisterIdText; err: unknown }[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      snses.push(result.value);
    } else {
      failures.push({
        rootCanisterId: rootCanisterIds[index],
        err: result.reason,
      });
    }
  });

  return { snses, failures };
};

// The actionable proposal counts include each SNS in these stores.
const resetActionableProposalsIfNotListed = (rootCanisterId: Principal) => {
  const rootCanisterIdText = rootCanisterId.toText();
  const isListed = get(snsProjectsCommittedStore).some(
    (project) => project.rootCanisterId.toText() === rootCanisterIdText
  );
  if (isListed) {
    return;
  }

  actionableSnsProposalsStore.resetForSns(rootCanisterId);
  failedActionableSnsesStore.remove(rootCanisterIdText);
};

const hasActionableProposals = (rootCanisterId: RootCanisterIdText) =>
  nonNullish(get(actionableSnsProposalsStore)[rootCanisterId]) ||
  get(failedActionableSnsesStore).includes(rootCanisterId);

/**
 * Keeps the actionable proposals in line with the imported SNSes that the app shows.
 *
 * A load after the first one can show an SNS that failed before, or hide an SNS that loaded before.
 * A removed SNS that the user imports again has no actionable proposals either.
 * The private app data loads the actionable proposals of the SNSes after the first load.
 */
const updateActionableProposals = ({
  shownBefore,
  shownAfter,
}: {
  shownBefore: Set<RootCanisterIdText>;
  shownAfter: Set<RootCanisterIdText>;
}) => {
  for (const rootCanisterId of shownBefore) {
    if (!shownAfter.has(rootCanisterId)) {
      resetActionableProposalsIfNotListed(Principal.fromText(rootCanisterId));
    }
  }

  if (!get(authSignedInStore)) {
    return;
  }

  for (const rootCanisterIdText of shownAfter) {
    if (hasActionableProposals(rootCanisterIdText)) {
      continue;
    }

    const rootCanisterId = Principal.fromText(rootCanisterIdText);
    // The user can remove the SNS while its proposals load.
    loadActionableProposalsForSns(rootCanisterId).then(() =>
      resetActionableProposalsIfNotListed(rootCanisterId)
    );
  }
};

/**
 * Loads each imported SNS into `loadedImportedSnsesStore`.
 *
 * Each SNS loads on its own. If one fails, an error toast shows its root
 * canister ID, and the other SNSes still load.
 *
 * The app calls this function on each navigation. Calls for the same list
 * share one load, and a load for an older list does not publish its result.
 * The promise of such a load resolves after the newer load publishes.
 *
 * After the first load, it also loads or removes the actionable proposals of
 * the imported SNSes that the load shows or hides.
 */
export const loadImportedSnses = (): Promise<void> => {
  const rootCanisterIds = get(importedSnsesStore);
  const key = rootCanisterIds.join(",");
  if (currentLoad?.key === key) {
    return currentLoad.promise;
  }

  const load: { key: string; promise: Promise<void> } = {
    key,
    promise: Promise.resolve(),
  };
  load.promise = loadSnses(rootCanisterIds).then(({ snses, failures }) => {
    // A newer call started another load, maybe for the same list.
    // The callers of this load, for example the private app data, wait for the newer one.
    if (currentLoad !== load) {
      return currentLoad?.promise;
    }

    for (const { rootCanisterId, err } of failures) {
      toastsError({
        labelKey: "error__imported_sns.load",
        substitutions: { $rootCanisterId: rootCanisterId },
        err,
        showDetails: true,
      });
    }
    const isFirstLoad = isNullish(
      get(loadedImportedSnsesStore).rootCanisterIds
    );
    const shownBefore = get(importedSnsRootCanisterIdsStore);
    loadedImportedSnsesStore.set({ rootCanisterIds, snses });

    if (!isFirstLoad) {
      updateActionableProposals({
        shownBefore,
        shownAfter: get(importedSnsRootCanisterIdsStore),
      });
    }
  });
  currentLoad = load;
  return load.promise;
};

/**
 * Loads an SNS for the review before the user imports it.
 *
 * Throws an `ImportedSnsError` if the user cannot import the SNS, or if it fails one of the checks.
 */
export const getSnsToImport = async (
  rootCanisterId: Principal
): Promise<CachedSnsDto> => {
  const rootCanisterIdText = rootCanisterId.toText();
  const importedRootCanisterIds = get(importedSnsesStore);

  if (importedRootCanisterIds.includes(rootCanisterIdText)) {
    throw new ImportedSnsError("already-imported");
  }

  // If the aggregator data is not loaded yet, `snsAggregatorStore` still hides a listed SNS.
  const isListed = get(snsAggregatorIncludingAbortedProjectsStore).data?.some(
    ({ canister_ids }) => canister_ids.root_canister_id === rootCanisterIdText
  );
  if (isListed === true) {
    throw new ImportedSnsError("already-listed");
  }

  if (importedRootCanisterIds.length >= MAX_IMPORTED_SNSES) {
    throw new ImportedSnsError("limit");
  }

  return getImportedSns(rootCanisterId);
};

/**
 * Adds the SNS to the imported list and loads the imported SNSes again.
 */
export const importSns = async (rootCanisterId: Principal): Promise<void> => {
  importedSnsesStore.add(rootCanisterId.toText());

  // The last load can be for the same list, for example after a failed load, a removal and a new import.
  currentLoad = undefined;
  await loadImportedSnses();
};

export const removeImportedSns = (rootCanisterId: Principal): void => {
  importedSnsesStore.remove(rootCanisterId.toText());
  resetActionableProposalsIfNotListed(rootCanisterId);
};
