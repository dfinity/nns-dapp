import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { getNervousSystemFunctions } from "$lib/api/sns-governance.api";
import { queryAllSnsMetadata, querySnsSwapStates } from "$lib/api/sns.api";
import { loadProposalsByTopic } from "$lib/services/$public/proposals.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { i18n } from "$lib/stores/i18n";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsProposalsStore, snsQueryStore } from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore, type TokensStoreData } from "$lib/stores/tokens.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { QuerySnsMetadata, QuerySnsSwapState } from "$lib/types/sns.query";
import { toToastError } from "$lib/utils/error.utils";
import { mapOptionalToken } from "$lib/utils/sns.utils";
import { nonNullish } from "$lib/utils/utils";
import { Topic, type ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { toNullable } from "@dfinity/utils";
import { get } from "svelte/store";

export const loadSnsProjects = async (): Promise<void> => {
  try {
    const cachedSnses = await querySnsProjects();
    const snsQueryStoreData: [QuerySnsMetadata[], QuerySnsSwapState[]] = [
      cachedSnses.map((sns) => ({
        rootCanisterId: sns.canister_ids.root_canister_id,
        certified: true,
        metadata: sns.meta,
        token: sns.icrc1_metadata,
      })),
      cachedSnses.map((sns) => ({
        rootCanisterId: sns.canister_ids.root_canister_id,
        certified: true,
        swapCanisterId: Principal.fromText(sns.canister_ids.swap_canister_id),
        governanceCanisterId: Principal.fromText(
          sns.canister_ids.governance_canister_id
        ),
        swap: toNullable(sns.swap_state.swap),
        derived: toNullable(sns.swap_state.derived),
      })),
    ];
    snsQueryStore.setData(snsQueryStoreData);
    snsFunctionsStore.setProjectsFunctions(
      cachedSnses.map((sns) => ({
        rootCanisterId: Principal.fromText(sns.canister_ids.root_canister_id),
        nsFunctions: sns.parameters.functions,
        certified: true,
      }))
    );
    transactionsFeesStore.setFees(
      cachedSnses
        .filter(({ icrc1_fee }) => icrc1_fee !== undefined)
        .map((sns) => ({
          rootCanisterId: Principal.fromText(sns.canister_ids.root_canister_id),
          // TS is not smart enought to know that we filtered out the undefined icrc1_fee above.
          fee: sns.icrc1_fee as bigint,
          certified: true,
        }))
    );
    tokensStore.setTokens(
      cachedSnses
        .map(({ icrc1_metadata, canister_ids: { root_canister_id } }) => ({
          token: mapOptionalToken(icrc1_metadata),
          root_canister_id,
        }))
        .filter(({ token }) => nonNullish(token))
        .reduce(
          (acc, { root_canister_id, token }) => ({
            ...acc,
            [root_canister_id]: {
              // Above filter ensure the token is not undefined therefore it can be safely cast
              token: token as IcrcTokenMetadata,
              certified: true,
            },
          }),
          {} as TokensStoreData
        )
    );
    // TODO: PENDING to be implemented, load SNS parameters.
  } catch (err) {
    // If aggregator canister fails, fallback to the old way
    // TODO: Agree on whether we want to fallback or not.
    // If the error is due to overload of the system, we might not want the fallback.
    // This is useful if the error comes from the aggregator canister only.
    await loadSnsSummaries();
  }
};

export const loadSnsSummaries = (): Promise<void> => {
  snsQueryStore.setLoadingState();

  return queryAndUpdate<[QuerySnsMetadata[], QuerySnsSwapState[]], unknown>({
    identityType: "anonymous",
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

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error__sns.list_summaries",
        })
      );
    },
    logMessage: "Syncing Sns summaries",
  });
};

export const loadProposalsSnsCF = async (): Promise<void> => {
  snsProposalsStore.setLoadingState();

  return queryAndUpdate<ProposalInfo[], unknown>({
    identityType: "anonymous",
    request: ({ certified }) =>
      loadProposalsByTopic({
        certified,
        topic: Topic.SnsAndCommunityFund,
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

      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.proposal_not_found",
        })
      );
    },
    logMessage: "Syncing Sns proposals",
  });
};

// This is a public service.
export const loadSnsNervousSystemFunctions = async (
  rootCanisterId: Principal
) => {
  const store = get(snsFunctionsStore);
  // Avoid loading the same data multiple times if the data loaded is certified
  if (store[rootCanisterId.toText()]?.certified) {
    return;
  }
  return queryAndUpdate<SnsNervousSystemFunction[], Error>({
    request: ({ certified, identity }) =>
      getNervousSystemFunctions({
        rootCanisterId,
        identity,
        certified,
      }),
    onLoad: async ({ response: nsFunctions, certified }) => {
      // TODO: Ideally, the name from the backend is user-friendly.
      // https://dfinity.atlassian.net/browse/GIX-1169
      const snsNervousSystemFunctions = nsFunctions.map((nsFunction) => {
        if (nsFunction.id === BigInt(0)) {
          const translationKeys = get(i18n);
          return {
            ...nsFunction,
            name: translationKeys.sns_neuron_detail.all_topics,
          };
        }
        return nsFunction;
      });
      snsFunctionsStore.setProjectFunctions({
        rootCanisterId,
        nsFunctions: snsNervousSystemFunctions,
        certified,
      });
    },
    identityType: "current",
    onError: ({ certified, error }) => {
      if (certified) {
        toastsError({
          labelKey: "error__sns.sns_load_functions",
          err: error,
        });
      }
    },
    logMessage: `Getting SNS ${rootCanisterId.toText()} nervous system functions`,
  });
};
