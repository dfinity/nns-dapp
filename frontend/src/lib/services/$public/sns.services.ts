import { querySnsProjects } from "$lib/api/sns-aggregator.api";
import { getNervousSystemFunctions } from "$lib/api/sns-governance.api";
import { buildAndStoreWrapper } from "$lib/api/sns-wrapper.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { getOrCreateSnsParametersProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
import { loadProposalsByTopic } from "$lib/services/$public/proposals.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { i18n } from "$lib/stores/i18n";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
import { snsProposalsStore, snsQueryStore } from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore, type TokensStoreData } from "$lib/stores/tokens.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type { QuerySnsMetadata, QuerySnsSwapState } from "$lib/types/sns.query";
import { isForceCallStrategy } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import { mapOptionalToken } from "$lib/utils/icrc-tokens.utils";
import { convertDtoData } from "$lib/utils/sns-aggregator-converters.utils";
import { Topic, type ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { nonNullish, toNullable } from "@dfinity/utils";
import { get } from "svelte/store";
import { getCurrentIdentity } from "../auth.services";

export const loadSnsProjects = async (): Promise<void> => {
  try {
    const aggregatorData = await querySnsProjects();
    snsAggregatorStore.setData(aggregatorData);
    // TODO: Store this in a svelte store.
    const cachedSnses = convertDtoData(aggregatorData);
    const identity = getCurrentIdentity();
    // We load the wrappers to avoid making calls to SNS-W and Root canister for each project.
    // The SNS Aggregator gives us the canister ids of the SNS projects.
    await Promise.all(
      cachedSnses.map(async ({ canister_ids }) => {
        const canisterIds = {
          rootCanisterId: Principal.fromText(canister_ids.root_canister_id),
          swapCanisterId: Principal.fromText(canister_ids.swap_canister_id),
          governanceCanisterId: Principal.fromText(
            canister_ids.governance_canister_id
          ),
          ledgerCanisterId: Principal.fromText(canister_ids.ledger_canister_id),
          indexCanisterId: Principal.fromText(canister_ids.index_canister_id),
        };
        // Build certified and uncertified wrappers because SNS aggregator gives certified data.
        await buildAndStoreWrapper({
          identity,
          certified: true,
          canisterIds,
        });
        await buildAndStoreWrapper({
          identity,
          certified: false,
          canisterIds,
        });
      })
    );
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
        ledgerCanisterId: Principal.fromText(
          sns.canister_ids.ledger_canister_id
        ),
        indexCanisterId: Principal.fromText(sns.canister_ids.index_canister_id),
        swap: toNullable(sns.swap_state.swap),
        derived: toNullable(sns.swap_state.derived),
      })),
    ];
    snsQueryStore.setData(snsQueryStoreData);
    snsTotalTokenSupplyStore.setTotalTokenSupplies(
      cachedSnses.map(({ icrc1_total_supply, canister_ids }) => ({
        rootCanisterId: Principal.fromText(canister_ids.root_canister_id),
        totalSupply: icrc1_total_supply,
        certified: true,
      }))
    );
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
    cachedSnses.forEach(
      ({ canister_ids: { root_canister_id }, derived_state }) => {
        snsQueryStore.updateDerivedState({
          rootCanisterId: root_canister_id,
          derivedState: derived_state,
        });
      }
    );
    // TODO: PENDING to be implemented, load SNS parameters.
  } catch (err) {
    toastsError(
      toToastError({
        err,
        fallbackErrorLabelKey: "error__sns.list_summaries",
      })
    );
  }
};

export const loadProposalsSnsCF = async (): Promise<void> => {
  snsProposalsStore.reset();

  return queryAndUpdate<ProposalInfo[], unknown>({
    identityType: "anonymous",
    strategy: FORCE_CALL_STRATEGY,
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
    onError: ({ error: err, certified, identity }) => {
      console.error(err);

      if (
        certified ||
        identity.getPrincipal().isAnonymous() ||
        isForceCallStrategy()
      ) {
        snsProposalsStore.reset();

        toastsError(
          toToastError({
            err,
            fallbackErrorLabelKey: "error.proposal_not_found",
          })
        );
      }
    },
    logMessage: "Syncing Sns proposals",
  });
};

// This is a public service.
export const loadSnsNervousSystemFunctions = async (
  rootCanisterId: Principal
) => {
  const store = getOrCreateSnsParametersProjectStore(rootCanisterId);
  const storeData = get(store);
  // Avoid loading the same data multiple times if the data is loaded
  if (nonNullish(storeData)) {
    return;
  }

  return queryAndUpdate<SnsNervousSystemFunction[], Error>({
    strategy: FORCE_CALL_STRATEGY,
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
    onError: ({ certified, error, identity }) => {
      // If the user is not logged in, only a query is done.
      // Therefore, we want to show an error even if the error doesn't come from a certified call.
      if (
        certified ||
        identity.getPrincipal().isAnonymous() ||
        isForceCallStrategy()
      ) {
        toastsError({
          labelKey: "error__sns.sns_load_functions",
          err: error,
        });
      }
    },
    logMessage: `Getting SNS ${rootCanisterId.toText()} nervous system functions`,
  });
};
