import { snsAggregatorApiService } from "$lib/api-services/sns-aggregator.api-service";
import { queryProposals } from "$lib/api/proposals.api";
import { buildAndStoreWrapper } from "$lib/api/sns-wrapper.api";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
import { queryAndUpdate } from "$lib/services/utils.services";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { snsTotalTokenSupplyStore } from "$lib/derived/sns-total-token-supply.derived";
import { snsProposalsStore } from "$lib/stores/sns.store";
import { toastsError } from "$lib/stores/toasts.store";
import { isForceCallStrategy } from "$lib/utils/env.utils";
import { toToastError } from "$lib/utils/error.utils";
import { ProposalStatus, Topic, type ProposalInfo } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
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
        includeTopics: [Topic.SnsAndCommunityFund],
        includeStatus: [ProposalStatus.Open],
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
