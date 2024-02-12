import { snsAggregatorApiService } from "$lib/api-services/sns-aggregator.api-service";
import { queryProposals } from "$lib/api/proposals.api";
import { getNervousSystemFunctions } from "$lib/api/sns-governance.api";
import { buildAndStoreWrapper } from "$lib/api/sns-wrapper.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { createSnsNsFunctionsProjectStore } from "$lib/derived/sns-ns-functions-project.derived";
import { queryAndUpdate } from "$lib/services/utils.services";
import { i18n } from "$lib/stores/i18n";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
import { snsProposalsStore } from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { isForceCallStrategy } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import { fillTokensStoreFromAggregatorData } from "$lib/utils/icrc-tokens.utils";
import { convertNervousFunction } from "$lib/utils/sns-aggregator-converters.utils";
import { ProposalStatus, Topic, type ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { SnsNervousSystemFunction } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { get } from "svelte/store";
import { getCurrentIdentity } from "../auth.services";

export const loadSnsProjects = async (): Promise<void> => {
  try {
    const aggregatorData = await snsAggregatorApiService.querySnsProjects();
    const identity = getCurrentIdentity();
    // We load the wrappers to avoid making calls to SNS-W and Root canister for each project.
    // The SNS Aggregator gives us the canister ids of the SNS projects.
    await Promise.all(
      aggregatorData.map(async ({ canister_ids }) => {
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

    // Calls to SNS canisters are done through an SNS Wrapper that first needs to be initialized with all the SNS canister ids.
    // If the wrapper is not initialized, it triggers a call to list_sns_canisters on the root canister of the SNS project.
    // This call is not necessary because the canister ids are already provided by the SNS aggregator.
    // As soon as the aggregator store is filled, SNS components may start rendering, resulting in calls on the SNS wrappers.
    // We set the aggregator store after building the wrappers' caches to avoid calls to the root canister when the SNS wrapper is initialized.
    snsAggregatorStore.setData(aggregatorData);
    snsTotalTokenSupplyStore.setTotalTokenSupplies(
      aggregatorData.map(({ icrc1_total_supply, canister_ids }) => ({
        rootCanisterId: Principal.fromText(canister_ids.root_canister_id),
        totalSupply: BigInt(icrc1_total_supply),
        certified: true,
      }))
    );
    snsFunctionsStore.setProjectsFunctions(
      aggregatorData.map((sns) => ({
        rootCanisterId: Principal.fromText(sns.canister_ids.root_canister_id),
        nsFunctions: sns.parameters.functions.map(convertNervousFunction),
        certified: true,
      }))
    );
    fillTokensStoreFromAggregatorData({
      tokensStore,
      aggregatorData,
    });
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
    request: ({ certified, identity }) =>
      queryProposals({
        beforeProposal: undefined,
        identity,
        filters: {
          topics: [Topic.SnsAndCommunityFund],
          rewards: [],
          status: [ProposalStatus.Open],
          excludeVotedProposals: false,
          lastAppliedFilter: undefined,
        },
        certified,
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
  const store = createSnsNsFunctionsProjectStore(rootCanisterId);
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
        if (nsFunction.id === 0n) {
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
