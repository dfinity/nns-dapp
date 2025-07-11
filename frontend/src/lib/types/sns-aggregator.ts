import type { IcrcMetadataResponseEntries } from "@dfinity/ledger-icrc";
import type { CanisterIdString } from "@dfinity/nns";
import type { SnsListTopicsResponse, SnsTopicInfo } from "@dfinity/sns";

type CanisterIds = {
  root_canister_id: string;
  governance_canister_id: string;
  ledger_canister_id: string;
  swap_canister_id: string;
  index_canister_id: string;
};

type ListSnsCanisterIds = {
  root: string;
  governance: string;
  ledger: string;
  swap: string;
  dapps: string[];
  archives: string[];
  index: string;
};

export type CachedSnsMetadataDto = {
  url: string | null;
  name: string | null;
  description: string | null;
};

type SubaccountDto = {
  subaccount: number[];
};

export type AccountDto = {
  owner: CanisterIdString | null;
  subaccount: SubaccountDto | null;
};

export type TreasuryMetricsDto = {
  // Same as, e.g., `TransferSnsTreasuryFunds.from_treasury`.
  treasury: number;
  // A human-readable identified for this treasury, e.g., "ICP".
  name: string | null;
  // The source of truth for the treasury balance is this ledger canister / account.
  ledger_canister_id: CanisterIdString | null;
  account: AccountDto | null;
  // The regularly updated amount of tokens in this treasury.
  amount_e8s: number | null;
  // The amount of tokens in this treasury at the end of swap finalization.
  original_amount_e8s: number | null;
  // When the metrics were last updated.
  timestamp_seconds: number | null;
};
type VotingPowerMetricsDto = {
  governance_total_potential_voting_power: number | null;
  // When the metrics were last updated.
  timestamp_seconds: number | null;
};
export type MetricsDto = {
  num_recently_submitted_proposals: number | null;
  num_recently_executed_proposals: number | null;
  last_ledger_block_timestamp: number | null;
  // The metrics below are cached (albeit this is an implementation detail).
  treasury_metrics: TreasuryMetricsDto[] | null;
  voting_power_metrics: VotingPowerMetricsDto | null;
  genesis_timestamp_seconds: number | null;
};
type GovernanceErrorDto = {
  error_message: string;
  error_type: number;
};
type GetMetricsResultDto = {
  Ok?: MetricsDto;
  Err?: GovernanceErrorDto;
};
// This type is a combined version of multiple IC/sns types, so it can't be directly converted to a single @dfinity/sns type.
export type CachedSnsMetricsDto = {
  get_metrics_result: GetMetricsResultDto;
};

type Topic =
  | { DappCanisterManagement: null }
  | { DaoCommunitySettings: null }
  | { ApplicationBusinessLogic: null }
  | { CriticalDappOperations: null }
  | { TreasuryAssetManagement: null }
  | { Governance: null }
  | { SnsFrameworkManagement: null };

interface GenericNervousSystemFunctionDto {
  validator_canister_id: string | null;
  target_canister_id: string | null;
  validator_method_name: string | null;
  target_method_name: string | null;
  topic: Topic | null;
}

export type CachedFunctionTypeDto =
  | { NativeNervousSystemFunction: Record<never, never> }
  | { GenericNervousSystemFunction: GenericNervousSystemFunctionDto };

export type CachedNervousFunctionDto = {
  id: number;
  name: string;
  description: string | null;
  function_type: CachedFunctionTypeDto | null;
};

export type CachedNeuronIdDto = {
  id: Uint8Array;
};

export type CachedFolloweesDto = {
  followees: CachedNeuronIdDto[];
};

export type CachedDefaultFolloweesDto = {
  followees: Array<[number, CachedFolloweesDto]>;
};

export type CachedNeuronPermissionListDto = {
  permissions: number[];
};

export type CachedVotingRewardsParametersDto = {
  final_reward_rate_basis_points?: number;
  initial_reward_rate_basis_points?: number;
  reward_rate_transition_duration_seconds?: number;
  round_duration_seconds?: number;
};

export type CachedNervousSystemParametersDto = {
  default_followees?: CachedDefaultFolloweesDto;
  max_dissolve_delay_seconds?: number;
  max_dissolve_delay_bonus_percentage?: number;
  max_followees_per_function?: number;
  neuron_claimer_permissions?: CachedNeuronPermissionListDto;
  neuron_minimum_stake_e8s?: number;
  max_neuron_age_for_age_bonus?: number;
  initial_voting_period_seconds?: number;
  neuron_minimum_dissolve_delay_to_vote_seconds?: number;
  reject_cost_e8s?: number;
  max_proposals_to_keep_per_action?: number;
  wait_for_quiet_deadline_increase_seconds?: number;
  max_number_of_neurons?: number;
  transaction_fee_e8s?: number;
  max_number_of_proposals_with_ballots?: number;
  max_age_bonus_percentage?: number;
  neuron_grantable_permissions?: CachedNeuronPermissionListDto;
  voting_rewards_parameters?: CachedVotingRewardsParametersDto;
  maturity_modulation_disabled?: boolean;
  max_number_of_principals_per_neuron?: number;
};

type CachedCountriesDto = {
  iso_codes: string[];
};

export type CachedSwapParamsDto = {
  min_participants: number;
  min_icp_e8s: number;
  max_icp_e8s: number;
  min_participant_icp_e8s: number;
  max_participant_icp_e8s: number;
  swap_due_timestamp_seconds: number;
  sns_token_e8s: number;
  neuron_basket_construction_parameters: {
    count: number;
    dissolve_delay_interval_seconds: number;
  };
  sale_delay_seconds?: number;
  min_direct_participation_icp_e8s?: number | null;
  max_direct_participation_icp_e8s?: number | null;
};

interface CachedLinearScalingCoefficient {
  slope_numerator?: number | null;
  slope_denominator?: number | null;
  intercept_icp_e8s?: number | null;
  from_direct_participation_icp_e8s?: number | null;
  to_direct_participation_icp_e8s?: number | null;
}

interface CachedIdealMatchedParticipationFunction {
  serialized_representation?: string | null;
}

export type CachedNeuronsFundParticipationConstraints = {
  coefficient_intervals: Array<CachedLinearScalingCoefficient>;
  max_neurons_fund_participation_icp_e8s?: number | null;
  min_direct_participation_threshold_icp_e8s?: number | null;
  ideal_matched_participation_function?: CachedIdealMatchedParticipationFunction;
};

// TODO: update when the candid is updated with the new init params
export type CachedSwapInitParamsDto = {
  // TODO: Recheck after next governance canister upgrade ~2023-08-14 (currently the aggregator returns null for next `null |` params)
  nns_proposal_id: null | number;
  max_icp_e8s: null | number;
  swap_start_timestamp_seconds: null | number;
  swap_due_timestamp_seconds: null | number;
  min_participants: null | number;
  sns_token_e8s: null | number;
  should_auto_finalize: null | boolean;
  max_participant_icp_e8s: null | number;
  min_icp_e8s: null | number;
  min_participant_icp_e8s: null | number;
  neuron_basket_construction_parameters: null | {
    dissolve_delay_interval_seconds: number;
    count: number;
  };
  //
  nns_governance_canister_id: string;
  sns_governance_canister_id: string;
  sns_ledger_canister_id: string;
  icp_ledger_canister_id: string;
  sns_root_canister_id: string;
  fallback_controller_principal_ids: string[];
  transaction_fee_e8s: number;
  neuron_minimum_stake_e8s: number;
  confirmation_text?: string | undefined;
  restricted_countries?: CachedCountriesDto | undefined;
  neurons_fund_participation_constraints?: CachedNeuronsFundParticipationConstraints | null;
  min_direct_participation_icp_e8s?: number | null;
  max_direct_participation_icp_e8s?: number | null;
  neurons_fund_participation?: boolean | null;
};

export type CachedSnsSwapDto = {
  lifecycle: number;
  decentralization_sale_open_timestamp_seconds?: number;
  finalize_swap_in_progress?: boolean;
  init: CachedSwapInitParamsDto | null;
  params: CachedSwapParamsDto | null;
  open_sns_token_swap_proposal_id: number | null;
  direct_participation_icp_e8s?: number | undefined | null;
  neurons_fund_participation_icp_e8s?: number | undefined | null;
};

export type CachedSnsSwapDerivedDto = {
  buyer_total_icp_e8s: number;
  sns_tokens_per_icp: number;
  cf_participant_count?: number | undefined | null;
  direct_participant_count?: number | undefined | null;
  cf_neuron_count?: number | undefined | null;
  direct_participation_icp_e8s?: number | undefined | null;
  neurons_fund_participation_icp_e8s?: number | undefined | null;
};

type CachedSwapParamsResponseDto = {
  params: CachedSwapParamsDto | null;
};

type CachedInitResponseDto = {
  init: CachedSwapInitParamsDto | null;
};

type ProposalIdDto = {
  id: number;
};

export type RewardEventDto = {
  rounds_since_last_distribution: number | null;
  actual_timestamp_seconds: number;
  end_timestamp_seconds: number | null;
  total_available_e8s_equivalent: number | null;
  distributed_e8s_equivalent: number;
  round: number;
  settled_proposals: Array<ProposalIdDto>;
};

export type CachedLifecycleResponseDto = {
  decentralization_sale_open_timestamp_seconds: number | null;
  lifecycle: number | null;
};

// Export for testing purposes
export type CachedSnsTokenMetadataDto = [
  string | IcrcMetadataResponseEntries,
  (
    | { Int: number[] }
    | { Nat: number[] }
    | { Blob: Uint8Array }
    | { Text: string }
  ),
][];

export type TopicInfoDto = {
  topic: string;
  name: string;
  description: string;
  native_functions: CachedNervousFunctionDto[];
  custom_functions: CachedNervousFunctionDto[];
  is_critical: boolean;
};

export type CachedListTopicsResponseDto = {
  topics: TopicInfoDto[];
  uncategorized_functions: CachedNervousFunctionDto[];
};

export type UnknownTopic = {
  UnknownTopic: null;
};

export const isUnknownTopic = (
  topic: Topic | UnknownTopic
): topic is UnknownTopic => "UnknownTopic" in topic;

// Same as TopicInfo but with the topic field being either a Topic or UnknownTopic
export interface TopicInfoWithUnknown extends Omit<SnsTopicInfo, "topic"> {
  topic: [] | [Topic | UnknownTopic];
}

export interface ListTopicsResponseWithUnknown
  extends Omit<SnsListTopicsResponse, "topics"> {
  topics: [] | [Array<TopicInfoWithUnknown>];
}

// Export for testing purposes
export type CachedSnsDto = {
  index: number;
  canister_ids: CanisterIds;
  list_sns_canisters: ListSnsCanisterIds;
  meta: CachedSnsMetadataDto;
  // Marked as optional because it could be missing in older aggregator versions.
  metrics?: CachedSnsMetricsDto;
  parameters: {
    functions: CachedNervousFunctionDto[];
    reserved_ids: number[];
  };
  nervous_system_parameters: CachedNervousSystemParametersDto;
  // @deprecated
  swap_state: {
    swap: CachedSnsSwapDto;
    derived: CachedSnsSwapDerivedDto;
  };
  icrc1_metadata: CachedSnsTokenMetadataDto;
  icrc1_fee: [] | [number];
  icrc1_total_supply: number;
  derived_state: CachedSnsSwapDerivedDto;
  swap_params: CachedSwapParamsResponseDto;
  init: CachedInitResponseDto;
  // Marked as optional because it could be missing in older aggregator versions.
  latest_reward_event?: RewardEventDto;
  lifecycle: CachedLifecycleResponseDto | null;
  // TODO(mstr): Make it not optional after all the canisters are upgraded.
  topics?: CachedListTopicsResponseDto;
};
