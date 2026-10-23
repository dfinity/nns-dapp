import {
  GOVERNANCE_CANISTER_ID,
  LEDGER_CANISTER_ID,
} from "$lib/constants/canister-ids.constants";
import type {
  CachedFunctionTypeDto,
  CachedListTopicsResponseDto,
  CachedNervousFunctionDto,
  CachedNervousSystemParametersDto,
  CachedSnsDto,
  CachedSnsMetadataDto,
  CachedSnsSwapDerivedDto,
  CachedSnsTokenMetadataDto,
  CachedSwapInitParamsDto,
  CachedSwapParamsDto,
  TopicInfoDto,
} from "$lib/types/sns-aggregator";
import { snsTopicToTopicKey } from "$lib/utils/sns-topics.utils";
import { fromNullable, isNullish } from "@dfinity/utils";
import type { IcrcTokenMetadataResponse } from "@icp-sdk/canisters/ledger/icrc";
import {
  SnsSwapLifecycle,
  type SnsGovernanceDid,
} from "@icp-sdk/canisters/sns";
import type { Principal } from "@icp-sdk/core/principal";

export interface ImportedSnsCanisterIds {
  root: Principal;
  governance: Principal;
  ledger: Principal;
  swap: Principal;
  index: Principal;
  dapps: Principal[];
  archives: Principal[];
}

export interface ImportedSnsData {
  canisterIds: ImportedSnsCanisterIds;
  metadata: SnsGovernanceDid.GetMetadataResponse;
  functions: SnsGovernanceDid.ListNervousSystemFunctionsResponse;
  parameters: SnsGovernanceDid.NervousSystemParameters;
  // Older SNS versions do not have `list_topics`.
  topics: SnsGovernanceDid.ListTopicsResponse | undefined;
  tokenMetadata: IcrcTokenMetadataResponse;
  fee: bigint;
  totalSupply: bigint;
}

const toOptionalNumber = <T extends bigint | number>(
  value: [] | [T]
): number | undefined => {
  const result = fromNullable(value);
  return isNullish(result) ? undefined : Number(result);
};

/**
 * Splits a non-negative bigint into 32-bit digits, least significant first.
 * This is the inverse of `candidNumberArrayToBigInt`.
 */
const bigIntToCandidNumberArray = (value: bigint): number[] => {
  const digits: number[] = [];
  let rest = value;
  do {
    digits.push(Number(rest & 0xffff_ffffn));
    rest >>= 32n;
  } while (rest > 0n);
  return digits;
};

export const toTokenMetadataDto = (
  metadata: IcrcTokenMetadataResponse
): CachedSnsTokenMetadataDto =>
  metadata.flatMap(([key, value]): CachedSnsTokenMetadataDto => {
    if ("Nat" in value) {
      return [[key, { Nat: bigIntToCandidNumberArray(value.Nat) }]];
    }
    if ("Nat64" in value) {
      return [[key, { Nat: bigIntToCandidNumberArray(value.Nat64) }]];
    }
    if ("Int" in value) {
      // The aggregator format has no sign, so negative values are dropped.
      return value.Int < 0n
        ? []
        : [[key, { Int: bigIntToCandidNumberArray(value.Int) }]];
    }
    if ("Text" in value || "Blob" in value) {
      return [[key, value]];
    }
    // The aggregator format has no `Map` or `Array` values.
    return [];
  });

const toFunctionTypeDto = (
  functionType: SnsGovernanceDid.FunctionType
): CachedFunctionTypeDto => {
  if ("NativeNervousSystemFunction" in functionType) {
    return { NativeNervousSystemFunction: {} };
  }
  const {
    validator_canister_id,
    target_canister_id,
    validator_method_name,
    target_method_name,
    topic,
  } = functionType.GenericNervousSystemFunction;
  return {
    GenericNervousSystemFunction: {
      validator_canister_id:
        fromNullable(validator_canister_id)?.toText() ?? null,
      target_canister_id: fromNullable(target_canister_id)?.toText() ?? null,
      validator_method_name: fromNullable(validator_method_name) ?? null,
      target_method_name: fromNullable(target_method_name) ?? null,
      topic: fromNullable(topic) ?? null,
    },
  };
};

export const toNervousFunctionDto = ({
  id,
  name,
  description,
  function_type,
}: SnsGovernanceDid.NervousSystemFunction): CachedNervousFunctionDto => {
  const functionType = fromNullable(function_type);
  return {
    id: Number(id),
    name,
    description: fromNullable(description) ?? null,
    function_type: isNullish(functionType)
      ? null
      : toFunctionTypeDto(functionType),
  };
};

export const toNervousSystemParametersDto = (
  parameters: SnsGovernanceDid.NervousSystemParameters
): CachedNervousSystemParametersDto => {
  const defaultFollowees = fromNullable(parameters.default_followees);
  const votingRewardsParameters = fromNullable(
    parameters.voting_rewards_parameters
  );
  const customProposalCriticality = fromNullable(
    parameters.custom_proposal_criticality
  );

  return {
    default_followees: isNullish(defaultFollowees)
      ? undefined
      : {
          followees: defaultFollowees.followees.map(
            ([functionId, followees]) => [Number(functionId), followees]
          ),
        },
    max_dissolve_delay_seconds: toOptionalNumber(
      parameters.max_dissolve_delay_seconds
    ),
    max_dissolve_delay_bonus_percentage: toOptionalNumber(
      parameters.max_dissolve_delay_bonus_percentage
    ),
    max_followees_per_function: toOptionalNumber(
      parameters.max_followees_per_function
    ),
    neuron_claimer_permissions: fromNullable(
      parameters.neuron_claimer_permissions
    ),
    neuron_minimum_stake_e8s: toOptionalNumber(
      parameters.neuron_minimum_stake_e8s
    ),
    max_neuron_age_for_age_bonus: toOptionalNumber(
      parameters.max_neuron_age_for_age_bonus
    ),
    initial_voting_period_seconds: toOptionalNumber(
      parameters.initial_voting_period_seconds
    ),
    neuron_minimum_dissolve_delay_to_vote_seconds: toOptionalNumber(
      parameters.neuron_minimum_dissolve_delay_to_vote_seconds
    ),
    reject_cost_e8s: toOptionalNumber(parameters.reject_cost_e8s),
    max_proposals_to_keep_per_action: toOptionalNumber(
      parameters.max_proposals_to_keep_per_action
    ),
    wait_for_quiet_deadline_increase_seconds: toOptionalNumber(
      parameters.wait_for_quiet_deadline_increase_seconds
    ),
    max_number_of_neurons: toOptionalNumber(parameters.max_number_of_neurons),
    transaction_fee_e8s: toOptionalNumber(parameters.transaction_fee_e8s),
    max_number_of_proposals_with_ballots: toOptionalNumber(
      parameters.max_number_of_proposals_with_ballots
    ),
    max_age_bonus_percentage: toOptionalNumber(
      parameters.max_age_bonus_percentage
    ),
    neuron_grantable_permissions: fromNullable(
      parameters.neuron_grantable_permissions
    ),
    voting_rewards_parameters: isNullish(votingRewardsParameters)
      ? undefined
      : {
          final_reward_rate_basis_points: toOptionalNumber(
            votingRewardsParameters.final_reward_rate_basis_points
          ),
          initial_reward_rate_basis_points: toOptionalNumber(
            votingRewardsParameters.initial_reward_rate_basis_points
          ),
          reward_rate_transition_duration_seconds: toOptionalNumber(
            votingRewardsParameters.reward_rate_transition_duration_seconds
          ),
          round_duration_seconds: toOptionalNumber(
            votingRewardsParameters.round_duration_seconds
          ),
        },
    maturity_modulation_disabled: fromNullable(
      parameters.maturity_modulation_disabled
    ),
    max_number_of_principals_per_neuron: toOptionalNumber(
      parameters.max_number_of_principals_per_neuron
    ),
    custom_proposal_criticality: isNullish(customProposalCriticality)
      ? undefined
      : {
          additional_critical_native_action_ids: Array.from(
            customProposalCriticality.additional_critical_native_action_ids,
            Number
          ),
        },
  };
};

const toTopicInfoDto = ({
  topic,
  name,
  description,
  native_functions,
  custom_functions,
  is_critical,
}: SnsGovernanceDid.TopicInfo): TopicInfoDto => {
  const topicValue = fromNullable(topic);
  return {
    topic: isNullish(topicValue)
      ? "UnknownTopic"
      : snsTopicToTopicKey(topicValue),
    name: fromNullable(name) ?? "",
    description: fromNullable(description) ?? "",
    native_functions: (fromNullable(native_functions) ?? []).map(
      toNervousFunctionDto
    ),
    custom_functions: (fromNullable(custom_functions) ?? []).map(
      toNervousFunctionDto
    ),
    is_critical: fromNullable(is_critical) ?? false,
  };
};

export const toListTopicsResponseDto = ({
  topics,
  uncategorized_functions,
}: SnsGovernanceDid.ListTopicsResponse): CachedListTopicsResponseDto => ({
  topics: (fromNullable(topics) ?? []).map(toTopicInfoDto),
  uncategorized_functions: (fromNullable(uncategorized_functions) ?? []).map(
    toNervousFunctionDto
  ),
});

const toMetadataDto = ({
  url,
  name,
  description,
}: SnsGovernanceDid.GetMetadataResponse): CachedSnsMetadataDto => ({
  url: fromNullable(url) ?? null,
  name: fromNullable(name) ?? null,
  description: fromNullable(description) ?? null,
});

// An imported SNS has no usable swap data, and the dapp never shows its swap.
// These values only satisfy the aggregator format.
const SWAP_PARAMS_PLACEHOLDER: CachedSwapParamsDto = {
  min_participants: 0,
  min_icp_e8s: 0,
  max_icp_e8s: 0,
  min_participant_icp_e8s: 0,
  max_participant_icp_e8s: 0,
  swap_due_timestamp_seconds: 0,
  sns_token_e8s: 0,
  neuron_basket_construction_parameters: {
    count: 0,
    dissolve_delay_interval_seconds: 0,
  },
};

const SWAP_DERIVED_PLACEHOLDER: CachedSnsSwapDerivedDto = {
  buyer_total_icp_e8s: 0,
  sns_tokens_per_icp: 0,
};

const swapInitPlaceholder = ({
  canisterIds,
  fee,
  neuronMinimumStakeE8s,
}: {
  canisterIds: ImportedSnsCanisterIds;
  fee: bigint;
  neuronMinimumStakeE8s: number | undefined;
}): CachedSwapInitParamsDto => ({
  nns_proposal_id: null,
  max_icp_e8s: null,
  swap_start_timestamp_seconds: null,
  swap_due_timestamp_seconds: null,
  min_participants: null,
  sns_token_e8s: null,
  should_auto_finalize: null,
  max_participant_icp_e8s: null,
  min_icp_e8s: null,
  min_participant_icp_e8s: null,
  neuron_basket_construction_parameters: null,
  nns_governance_canister_id: GOVERNANCE_CANISTER_ID.toText(),
  sns_governance_canister_id: canisterIds.governance.toText(),
  sns_ledger_canister_id: canisterIds.ledger.toText(),
  icp_ledger_canister_id: LEDGER_CANISTER_ID.toText(),
  sns_root_canister_id: canisterIds.root.toText(),
  fallback_controller_principal_ids: [],
  transaction_fee_e8s: Number(fee),
  neuron_minimum_stake_e8s: neuronMinimumStakeE8s ?? 0,
});

/**
 * Converts the canister responses of an imported SNS to the format of the SNS aggregator.
 *
 * The swap fields are placeholders with the lifecycle `Committed`, so the SNS
 * shows like a launched SNS in the token, neuron and proposal views.
 */
export const toCachedSnsDto = ({
  canisterIds,
  metadata,
  functions,
  parameters,
  topics,
  tokenMetadata,
  fee,
  totalSupply,
}: ImportedSnsData): CachedSnsDto => {
  const nervousSystemParameters = toNervousSystemParametersDto(parameters);
  const init = swapInitPlaceholder({
    canisterIds,
    fee,
    neuronMinimumStakeE8s: nervousSystemParameters.neuron_minimum_stake_e8s,
  });

  return {
    // Imported SNSes have no position in the aggregator list.
    index: -1,
    canister_ids: {
      root_canister_id: canisterIds.root.toText(),
      governance_canister_id: canisterIds.governance.toText(),
      ledger_canister_id: canisterIds.ledger.toText(),
      swap_canister_id: canisterIds.swap.toText(),
      index_canister_id: canisterIds.index.toText(),
    },
    list_sns_canisters: {
      root: canisterIds.root.toText(),
      governance: canisterIds.governance.toText(),
      ledger: canisterIds.ledger.toText(),
      swap: canisterIds.swap.toText(),
      index: canisterIds.index.toText(),
      dapps: canisterIds.dapps.map((id) => id.toText()),
      archives: canisterIds.archives.map((id) => id.toText()),
    },
    meta: toMetadataDto(metadata),
    parameters: {
      functions: functions.functions.map(toNervousFunctionDto),
      reserved_ids: Array.from(functions.reserved_ids, Number),
    },
    nervous_system_parameters: nervousSystemParameters,
    swap_state: {
      swap: {
        lifecycle: SnsSwapLifecycle.Committed,
        init,
        params: SWAP_PARAMS_PLACEHOLDER,
        open_sns_token_swap_proposal_id: null,
      },
      derived: SWAP_DERIVED_PLACEHOLDER,
    },
    icrc1_metadata: toTokenMetadataDto(tokenMetadata),
    icrc1_fee: [Number(fee)],
    icrc1_total_supply: Number(totalSupply),
    derived_state: SWAP_DERIVED_PLACEHOLDER,
    swap_params: { params: SWAP_PARAMS_PLACEHOLDER },
    init: { init },
    lifecycle: {
      lifecycle: SnsSwapLifecycle.Committed,
      decentralization_sale_open_timestamp_seconds: null,
    },
    topics: isNullish(topics) ? undefined : toListTopicsResponseDto(topics),
  };
};
