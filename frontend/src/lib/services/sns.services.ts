import {
  ICP,
  Topic,
  type AccountIdentifier,
  type ProposalInfo,
} from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import {
  participateInSnsSwap,
  querySnsSummaries,
  querySnsSummary,
  querySnsSwapCommitment,
  querySnsSwapCommitments,
  querySnsSwapState,
  querySnsSwapStates,
} from "../api/sns.api";
import { AppPath } from "../constants/routes.constants";
import {
  snsProposalsStore,
  snsQueryStore,
  snsSwapCommitmentsStore,
} from "../stores/sns.store";
import { toastsStore } from "../stores/toasts.store";
import type { Account } from "../types/account";
import type { SnsSwapCommitment } from "../types/sns";
import type { QuerySnsSummary, QuerySnsSwapState } from "../types/sns.query";
import { getLastPathDetail, isRoutePath } from "../utils/app-path.utils";
import { toToastError } from "../utils/error.utils";
import { getSwapCanisterAccount } from "../utils/sns.utils";
import { getAccountIdentity } from "./accounts.services";
import { getIdentity } from "./auth.services";
import { loadProposalsByTopic } from "./proposals.services";
import { queryAndUpdate } from "./utils.services";

export const loadSnsSummaries = (): Promise<void> => {
  snsQueryStore.setLoadingState();

  return queryAndUpdate<[QuerySnsSummary[], QuerySnsSwapState[]], unknown>({
    request: ({ certified, identity }) =>
      Promise.all([
        querySnsSummaries({ certified, identity }),
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
    [QuerySnsSummary | undefined, QuerySnsSwapState | undefined],
    unknown
  >({
    request: ({ certified, identity }) =>
      Promise.all([
        querySnsSummary({
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

export const participateInSwap = async ({
  amount,
  rootCanisterId,
  account,
  onSuccess,
}: {
  amount: ICP;
  rootCanisterId: Principal;
  account: Account;
  onSuccess?: () => void;
}): Promise<{ success: boolean }> => {
  try {
    const accountIdentity = await getAccountIdentity(account.identifier);

    await participateInSnsSwap({
      identity: accountIdentity,
      rootCanisterId,
      amount,
      controller: accountIdentity.getPrincipal(),
      fromSubAccount: "subAccount" in account ? account.subAccount : undefined,
    });

    onSuccess?.();

    return { success: true };
  } catch (error) {
    // TODO: Manage errors https://dfinity.atlassian.net/browse/L2-798
    return { success: false };
  }
};
