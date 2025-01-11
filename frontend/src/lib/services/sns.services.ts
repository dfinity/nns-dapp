import {
  querySnsDerivedState,
  querySnsLifecycle,
  querySnsSwapCommitment,
} from "$lib/api/sns.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { WATCH_SALE_STATE_EVERY_MILLISECONDS } from "$lib/constants/sns.constants";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { getLoadedSnsAggregatorData } from "$lib/services/public/sns.services";
import {
  queryAndUpdate,
  type QueryAndUpdateStrategy,
} from "$lib/services/utils.services";
import { snsDerivedStateStore } from "$lib/stores/sns-derived-state.store";
import { snsLifecycleStore } from "$lib/stores/sns-lifecycle.store";
import { snsSwapCommitmentsStore } from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { isLastCall } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import type { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import type {
  SnsGetDerivedStateResponse,
  SnsGetLifecycleResponse,
} from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";

/**
 * Loads the user commitments for all projects.
 *
 * If the commitments are already loaded, it will not reload them.
 */
export const loadSnsSwapCommitments = async (): Promise<void> => {
  const aggregatorData = await getLoadedSnsAggregatorData();
  await Promise.allSettled(
    aggregatorData.map(
      ({ canister_ids: { root_canister_id: rootCanisterId } }) =>
        loadSnsSwapCommitment({
          rootCanisterId,
        })
    )
  );
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
  await queryAndUpdate<SnsSwapCommitment, unknown>({
    strategy: forceFetch ? "update" : FORCE_CALL_STRATEGY,
    request: ({ certified, identity }) =>
      querySnsSwapCommitment({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: ({ response: swapCommitment, certified }) =>
      snsSwapCommitmentsStore.setSwapCommitment({ swapCommitment, certified }),
    onError: ({ error: err, certified, strategy }) => {
      console.error(err);

      if (isLastCall({ strategy, certified })) {
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

export const loadSnsDerivedState = async ({
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
    onLoad: ({ response: derivedState, certified }) => {
      if (derivedState !== undefined) {
        snsDerivedStateStore.setDerivedState({
          rootCanisterId: Principal.fromText(rootCanisterId),
          certified,
          data: derivedState,
        });
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
    loadSnsDerivedState({ rootCanisterId, strategy: "query" });
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
    onLoad: ({ response: lifecycleResponse, certified }) => {
      if (nonNullish(lifecycleResponse)) {
        snsLifecycleStore.setData({
          rootCanisterId: Principal.from(rootCanisterId),
          data: lifecycleResponse,
          certified,
        });
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
