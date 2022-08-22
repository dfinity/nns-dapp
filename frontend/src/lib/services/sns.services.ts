import {
  ICP,
  Topic,
  type AccountIdentifier,
  type ProposalInfo,
} from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { get } from "svelte/store";
import {
  participateInSnsSwap,
  queryAllSnsMetadata,
  querySnsMetadata,
  querySnsSwapCommitment,
  querySnsSwapCommitments,
  querySnsSwapState,
  querySnsSwapStates,
} from "../api/sns.api";
import { AppPath } from "../constants/routes.constants";
import { projectsStore, type SnsFullProject } from "../stores/projects.store";
import {
  snsProposalsStore,
  snsQueryStore,
  snsSwapCommitmentsStore,
} from "../stores/sns.store";
import { toastsStore } from "../stores/toasts.store";
import { transactionsFeesStore } from "../stores/transaction-fees.store";
import type { Account } from "../types/account";
import { LedgerErrorKey } from "../types/ledger.errors";
import type { SnsSwapCommitment } from "../types/sns";
import type { QuerySnsMetadata, QuerySnsSwapState } from "../types/sns.query";
import { assertEnoughAccountFunds } from "../utils/accounts.utils";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { toToastError } from "../utils/error.utils";
import {
  commitmentExceedsAmountLeft,
  validParticipation,
} from "../utils/projects.utils";
import { getSwapCanisterAccount } from "../utils/sns.utils";
import { getAccountIdentity, syncAccounts } from "./accounts.services";
import { getIdentity } from "./auth.services";
import { loadProposalsByTopic } from "./proposals.services";
import { queryAndUpdate } from "./utils.services";

export const loadSnsSummaries = (): Promise<void> => {
  snsQueryStore.setLoadingState();

  return queryAndUpdate<[QuerySnsMetadata[], QuerySnsSwapState[]], unknown>({
    request: ({ certified, identity }) =>
      Promise.all([
        queryAllSnsMetadata({ certified, identity }),
        querySnsSwapStates({ certified, identity }),
      ]),
    onLoad: ({ response }) => snsQueryStore.setData(response),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsQueryStore.setLoadingState();

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.list_summaries",
        })
      );
    },
    logMessage: "Syncing Sns summaries",
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

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_summary",
        })
      );

      onError();
    },
    logMessage: "Syncing Sns summary",
  });

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

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.list_swap_commitments",
        })
      );
    },
    logMessage: "Syncing Sns swap commitments",
  });
};

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

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.load_swap_commitment",
        })
      );

      onError();
    },
    logMessage: "Syncing Sns swap commitment",
  });

export const listSnsProposals = async (): Promise<void> => {
  snsProposalsStore.setLoadingState();

  return queryAndUpdate<ProposalInfo[], unknown>({
    request: ({ certified, identity }) =>
      loadProposalsByTopic({
        certified,
        identity,
        topic: Topic.SnsDecentralizationSale,
      }),
    onLoad: ({ response: proposals, certified }) =>
      snsProposalsStore.setProposals({
        proposals,
        certified,
      }),
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified !== true) {
        return;
      }

      // hide unproven data
      snsProposalsStore.setLoadingState();

      toastsStore.error(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.proposal_not_found",
        })
      );
    },
    logMessage: "Syncing Sns proposals",
  });
};

export const routePathRootCanisterId = (path: string): string | undefined => {
  if (!isRoutePath({ path: AppPath.ProjectDetail, routePath: path })) {
    return undefined;
  }
  return getLastPathDetail(path);
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
  amount: ICP;
  rootCanisterId: Principal;
  account: Account;
}): Promise<{ success: boolean }> => {
  let success = false;
  let project: SnsFullProject | undefined;
  try {
    const transactionFee = get(transactionsFeesStore).main;
    assertEnoughAccountFunds({
      account,
      amountE8s: amount.toE8s() + transactionFee,
    });
    project = getProjectFromStore(rootCanisterId);
    const { valid, labelKey, substitutions } = validParticipation({
      project,
      amount,
    });
    if (!valid) {
      // TODO: Rename LedgerErroKey to NnsDappErrorKey?
      throw new LedgerErrorKey(labelKey, substitutions);
    }

    const accountIdentity = await getAccountIdentity(account.identifier);

    await participateInSnsSwap({
      identity: accountIdentity,
      rootCanisterId,
      amount,
      controller: accountIdentity.getPrincipal(),
      fromSubAccount: "subAccount" in account ? account.subAccount : undefined,
    });

    success = true;
    await syncAccounts();

    return { success };
  } catch (error) {
    // The last commitment might trigger this error
    // because the backend is faster than the frontend at notifying the commitment.
    if (
      error.message?.includes("'open' state") === true &&
      project?.summary !== undefined &&
      // If it's the last commitment, it means that one more e8 is not a valid participation.
      commitmentExceedsAmountLeft({
        summary: project?.summary,
        amountE8s: amount.toE8s() + BigInt(1),
      })
    ) {
      await syncAccounts();
      return { success: true };
    }
    toastsStore.error(
      toToastError({
        err: error,
        fallbackErrorLabelKey: "error__sns.cannot_participate",
      })
    );
    return { success };
  }
};
