import {
  participateInSnsSwap,
  querySnsMetadata,
  querySnsSwapCommitment, querySnsSwapCommitments,
  querySnsSwapState,
} from "$lib/api/sns.api";
import { projectsStore, type SnsFullProject } from "$lib/stores/projects.store";
import { snsQueryStore, snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { Account } from "$lib/types/account";
import { LedgerErrorKey } from "$lib/types/ledger.errors";
import type { SnsSwapCommitment } from "$lib/types/sns";
import type { QuerySnsMetadata, QuerySnsSwapState } from "$lib/types/sns.query";
import { assertEnoughAccountFunds } from "$lib/utils/accounts.utils";
import { toToastError } from "$lib/utils/error.utils";
import {
  commitmentExceedsAmountLeft,
  validParticipation,
} from "$lib/utils/projects.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import type { AccountIdentifier, TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import { getAccountIdentity, syncAccounts } from "./accounts.services";
import { getIdentity } from "./auth.services";
import { queryAndUpdate } from "./utils.services";

export const loadSnsSwapCommitments = (): Promise<void> => {
  snsSwapCommitmentsStore.setLoadingState();

  return queryAndUpdate<SnsSwapCommitment[], unknown>({
    request: ({ certified, identity }) =>
        querySnsSwapCommitments({ certified, identity }),
    onLoad: ({ response: swapCommitments, certified }) => {
      for (const swapCommitment of swapCommitments) {
        snsSwapCommitmentsStore.setSwapCommitment({
          swapCommitment,
          certified,
        });
      }
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsSwapCommitmentsStore.setLoadingState();

      toastsError(
          toToastError({
            err,
            fallbackErrorLabelKey: "error__sns.list_swap_commitments",
          })
      );
    },
    logMessage: "Syncing Sns swap commitments",
  });
};

/** Combined request: querySnsSummary + querySnsSwapState */
export const loadSnsSummary = async ({
  rootCanisterId,
  onError,
}: {
  rootCanisterId: string;
  onError: () => void;
}) =>
  queryAndUpdate<
    [QuerySnsMetadata | undefined, QuerySnsSwapState | undefined],
    unknown
  >({
    request: ({ certified, identity }) =>
      Promise.all([
        querySnsMetadata({
          rootCanisterId,
          identity,
          certified,
        }),
        querySnsSwapState({ rootCanisterId, identity, certified }),
      ]),
    onLoad: ({ response: data }) =>
      snsQueryStore.updateData({ data, rootCanisterId }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_summary",
        })
      );

      onError();
    },
    logMessage: "Syncing Sns summary",
  });

export const loadSnsSwapCommitment = async ({
  rootCanisterId,
  onError,
}: {
  rootCanisterId: string;
  onError: () => void;
}) =>
  queryAndUpdate<SnsSwapCommitment, unknown>({
    request: ({ certified, identity }) =>
      querySnsSwapCommitment({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response: swapCommitment, certified }) =>
      snsSwapCommitmentsStore.setSwapCommitment({ swapCommitment, certified }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_swap_commitment",
        })
      );

      onError();
    },
    logMessage: "Syncing Sns swap commitment",
  });

/**
 * Requests swap state and loads it in the store.
 * Ignores possible undefined. This is used only to recheck the data with up-to-date information.
 * This should be used only when the data is already in the store.
 * That's why if an error happens, we want to rely on the data that it's already in the store.
 *
 * @param {Principal} rootCanisterId Root canister id of the project.
 */
const reloadSnsState = async (rootCanisterId: Principal): Promise<void> => {
  try {
    const identity = await getIdentity();
    const swapData = await querySnsSwapState({
      rootCanisterId: rootCanisterId.toText(),
      identity,
      certified: true,
    });
    snsQueryStore.updateSwapState({
      swapData,
      rootCanisterId: rootCanisterId.toText(),
    });
  } catch (err) {
    // Ignore error
    console.error("Error reloading swap state", err);
  }
};

export const getSwapAccount = async (
  swapCanisterId: Principal
): Promise<AccountIdentifier> => {
  const identity = await getIdentity();
  return getSwapCanisterAccount({
    controller: identity.getPrincipal(),
    swapCanisterId,
  });
};

const getProjectFromStore = (
  rootCanisterId: Principal
): SnsFullProject | undefined =>
  get(projectsStore)?.find(
    ({ rootCanisterId: id }) => id.toText() === rootCanisterId.toText()
  );

export const participateInSwap = async ({
  amount,
  rootCanisterId,
  account,
}: {
  amount: TokenAmount;
  rootCanisterId: Principal;
  account: Account;
}): Promise<{ success: boolean }> => {
  let success = false;
  try {
    const transactionFee = get(transactionsFeesStore).main;
    assertEnoughAccountFunds({
      account,
      amountE8s: amount.toE8s() + transactionFee,
    });
    // TODO: Move the logic to the `catch` for a faster participation.
    // At the moment we can't move it to the `catch`
    // because it's hard for us to differentiate when the error comes from stale data or the second notify for the last participation.
    //
    // Reload the sale state before validating the participation.
    // The current state might have change since it was loaded.
    // This might prevent transferring funds that will not be accepted as participation and avoid refunds.
    await reloadSnsState(rootCanisterId);
    const project = getProjectFromStore(rootCanisterId);
    const { valid, labelKey, substitutions } = validParticipation({
      project,
      amount,
    });
    if (!valid) {
      // TODO: Rename LedgerErroKey to NnsDappErrorKey?
      throw new LedgerErrorKey(labelKey, substitutions);
    }

    const accountIdentity = await getAccountIdentity(account.identifier);

    try {
      await participateInSnsSwap({
        identity: accountIdentity,
        rootCanisterId,
        amount,
        controller: accountIdentity.getPrincipal(),
        fromSubAccount:
          "subAccount" in account ? account.subAccount : undefined,
      });
    } catch (error: unknown) {
      // The last commitment might trigger this error
      // because the backend is faster than the frontend at notifying the commitment.
      // Backend error line: https://github.com/dfinity/ic/blob/6ccf23ec7096b117c476bdcd34caa6fada84a3dd/rs/sns/swap/src/swap.rs#L461
      const openStateError =
        error instanceof Error &&
        error.message?.includes("OPEN state") === true;
      // If it's the last commitment, it means that one more e8 is not a valid participation.
      const lastCommitment =
        project?.summary !== undefined &&
        commitmentExceedsAmountLeft({
          summary: project?.summary,
          amountE8s: amount.toE8s() + BigInt(1),
        });
      if (!(openStateError && lastCommitment)) {
        throw error;
      }
    }

    success = true;
    await syncAccounts();

    return { success };
  } catch (error: unknown) {
    toastsError(
      toToastError({
        err: error,
        fallbackErrorLabelKey: "error__sns.cannot_participate",
      })
    );
    return { success };
  }
};
