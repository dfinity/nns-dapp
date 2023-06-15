import {
  querySnsDerivedState,
  querySnsLifecycle,
  querySnsSwapCommitment,
  querySnsSwapCommitments,
} from "$lib/api/sns.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { WATCH_SALE_STATE_EVERY_MILLISECONDS } from "$lib/constants/sns.constants";
import {
  snsQueryStore,
  snsSummariesStore,
  snsSwapCommitmentsStore,
} from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import {
  isForceCallStrategy,
  notForceCallStrategy,
} from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import type { AccountIdentifier } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsGetDerivedStateResponse,
  SnsGetLifecycleResponse,
} from "@dfinity/sns";
import { fromNullable, nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { getAuthenticatedIdentity } from "./auth.services";
import { queryAndUpdate, type QueryAndUpdateStrategy } from "./utils.services";

/**
 * Loads the user commitments for all projects.
 *
 * If the commitments are already loaded, it will not reload them.
 *
 * We rely that the projects are already loaded to skip loading the commitments.
 * If commitments is 0, it will load them always.
 *
 * Therefore, this can be called before the projects are loaded.
 */
export const loadSnsSwapCommitments = async (): Promise<void> => {
  const commitmentsCanisterIds = new Set(
    (get(snsSwapCommitmentsStore) ?? [])
      .filter(({ certified }) => certified)
      .map(({ swapCommitment: { rootCanisterId } }) => rootCanisterId.toText())
  );
  const snsProjectsCanisterIds = new Set(
    (get(snsSummariesStore) ?? []).map(({ rootCanisterId }) =>
      rootCanisterId.toText()
    )
  );
  // Skip if we have commitments for all projects.
  if (
    commitmentsCanisterIds.size > 0 &&
    commitmentsCanisterIds.size >= snsProjectsCanisterIds.size &&
    [...snsProjectsCanisterIds].every((id) => commitmentsCanisterIds.has(id))
  ) {
    return;
  }

  return queryAndUpdate<SnsSwapCommitment[], unknown>({
    strategy: FORCE_CALL_STRATEGY,
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

      if (!certified && notForceCallStrategy()) {
        return;
      }

      // hide unproven data
      snsSwapCommitmentsStore.reset();

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

export const loadSnsSwapCommitment = async ({
  rootCanisterId,
  onError,
  forceFetch = false,
}: {
  rootCanisterId: string;
  onError?: () => void;
  forceFetch?: boolean;
}) => {
  const swapCommitment = (get(snsSwapCommitmentsStore) ?? []).find(
    ({ swapCommitment }) =>
      swapCommitment.rootCanisterId.toText() === rootCanisterId
  );

  if (nonNullish(swapCommitment) && !forceFetch) {
    return;
  }

  // We use update when we want to force fetch the data to make sure we have the latest data.
  queryAndUpdate<SnsSwapCommitment, unknown>({
    strategy: forceFetch ? "update" : FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      querySnsSwapCommitment({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response: swapCommitment, certified }) =>
      snsSwapCommitmentsStore.setSwapCommitment({ swapCommitment, certified }),
    onError: ({ error: err, certified, identity }) => {
      console.error(err);

      if (
        certified ||
        identity.getPrincipal().isAnonymous() ||
        isForceCallStrategy()
      ) {
        toastsError(
          toToastError({
            err,
            fallbackErrorLabelKey: "error__sns.load_swap_commitment",
          })
        );

        onError?.();
      }
    },
    logMessage: "Syncing Sns swap commitment",
  });
};

export const loadSnsTotalCommitment = async ({
  rootCanisterId,
  strategy,
}: {
  rootCanisterId: string;
  strategy?: QueryAndUpdateStrategy;
}) =>
  queryAndUpdate<SnsGetDerivedStateResponse | undefined, unknown>({
    strategy: strategy ?? FORCE_CALL_STRATEGY,
    identityType: "current",
    request: ({ certified, identity }) =>
      querySnsDerivedState({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response: derivedState }) => {
      if (derivedState !== undefined) {
        snsQueryStore.updateDerivedState({ derivedState, rootCanisterId });
      }
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified) {
        toastsError(
          toToastError({
            err,
            fallbackErrorLabelKey: "error__sns.load_sale_total_commitments",
          })
        );
      }
    },
    logMessage: "Syncing Sns swap commitment",
  });

export const watchSnsTotalCommitment = ({
  rootCanisterId,
}: {
  rootCanisterId: string;
}) => {
  const id = setInterval(() => {
    loadSnsTotalCommitment({ rootCanisterId, strategy: "query" });
  }, WATCH_SALE_STATE_EVERY_MILLISECONDS);

  return () => {
    clearInterval(id);
  };
};

export const loadSnsLifecycle = async ({
  rootCanisterId,
}: {
  rootCanisterId: string;
}) =>
  queryAndUpdate<SnsGetLifecycleResponse | undefined, unknown>({
    request: ({ certified, identity }) =>
      querySnsLifecycle({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response: lifecycleResponse }) => {
      const lifecycle = fromNullable(lifecycleResponse?.lifecycle ?? []);
      if (nonNullish(lifecycle)) {
        snsQueryStore.updateLifecycle({ lifecycle, rootCanisterId });
      }
    },
    onError: ({ error: err, certified }) => {
      console.error(err);

      if (certified) {
        toastsError(
          toToastError({
            err,
            fallbackErrorLabelKey: "error__sns.load_sale_lifecycle",
          })
        );
      }
    },
    logMessage: "Syncing Sns lifecycle",
  });

export const getSwapAccount = async (
  swapCanisterId: Principal
): Promise<AccountIdentifier> => {
  const identity = await getAuthenticatedIdentity();
  return getSwapCanisterAccount({
    controller: identity.getPrincipal(),
    swapCanisterId,
  });
};
