import { queryIcrcMintingAccount } from "$lib/api/icrc-ledger.api";
import {
  queryCanistersControllers,
  querySnsCanisterIds,
  querySnsGovernanceData,
  querySnsGovernanceMode,
  querySnsLedgerData,
  querySnsTopics,
} from "$lib/api/imported-sns.api";
import { ENABLE_IMPORT_SNS } from "$lib/stores/feature-flags.store";
import {
  importedSnsesStore,
  loadedImportedSnsesStore,
} from "$lib/stores/imported-snses.store";
import { toastsError } from "$lib/stores/toasts.store";
import { ImportedSnsError } from "$lib/types/imported-sns.errors";
import type { RootCanisterIdText } from "$lib/types/sns";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import {
  toCachedSnsDto,
  type ImportedSnsCanisterIds,
} from "$lib/utils/imported-sns.utils";
import { registerCleanupForTesting } from "$lib/utils/test-support.utils";
import { fromNullable, isNullish } from "@dfinity/utils";
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
  const [controllers, mintingAccount, { mode }] = await Promise.all([
    queryCanistersControllers({
      identity,
      canisterIds: [governance, root, ledger, index],
    }),
    queryIcrcMintingAccount({ identity, canisterId: ledger, certified: false }),
    querySnsGovernanceMode({ identity, governanceCanisterId: governance }),
  ]);
  const [
    governanceControllers,
    rootControllers,
    ledgerControllers,
    indexControllers,
  ] = controllers;

  if (
    !includesPrincipal(governanceControllers, root) ||
    !includesPrincipal(rootControllers, governance) ||
    !includesPrincipal(ledgerControllers, root) ||
    !includesPrincipal(indexControllers, root)
  ) {
    throw new ImportedSnsError("controllers");
  }

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
    }).catch(() => undefined),
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

/**
 * Loads each imported SNS into `loadedImportedSnsesStore`.
 *
 * Each SNS loads on its own. If one fails, an error toast shows its root
 * canister ID, and the other SNSes still load.
 *
 * The app calls this function on each navigation. Calls for the same list
 * share one load, and a load for an older list does not publish its result.
 */
export const loadImportedSnses = (): Promise<void> => {
  if (!get(ENABLE_IMPORT_SNS)) {
    return Promise.resolve();
  }

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
    if (currentLoad !== load) {
      return;
    }

    for (const { rootCanisterId, err } of failures) {
      toastsError({
        labelKey: "error__imported_sns.load",
        substitutions: { $rootCanisterId: rootCanisterId },
        err,
        showDetails: true,
      });
    }
    loadedImportedSnsesStore.set({ rootCanisterIds, snses });
  });
  currentLoad = load;
  return load.promise;
};
