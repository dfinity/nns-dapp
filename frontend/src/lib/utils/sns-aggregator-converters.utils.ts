import DEFAULT_SNS_LOGO from "$lib/assets/sns-logo-default.svg";
import { SNS_AGGREGATOR_CANISTER_URL } from "$lib/constants/environment.constants";
import { AGGREGATOR_CANISTER_VERSION } from "$lib/constants/sns.constants";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsSummarySwap,
} from "$lib/types/sns";
import type {
  CachedDefaultFolloweesDto,
  CachedFunctionTypeDto,
  CachedLifecycleResponseDto,
  CachedNervousFunctionDto,
  CachedNervousSystemParametersDto,
  CachedNeuronsFundParticipationConstraints,
  CachedSnsDto,
  CachedSnsMetadataDto,
  CachedSnsSwapDerivedDto,
  CachedSnsSwapDto,
  CachedSnsTokenMetadataDto,
  CachedSwapInitParamsDto,
  CachedSwapParamsDto,
  CachedVotingRewardsParametersDto,
} from "$lib/types/sns-aggregator";
import { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import type { IcrcTokenMetadataResponse } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import type {
  SnsDefaultFollowees,
  SnsFunctionType,
  SnsGetLifecycleResponse,
  SnsNervousSystemFunction,
  SnsNervousSystemParameters,
  SnsNeuronsFundParticipationConstraints,
  SnsParams,
  SnsSwapDerivedState,
  SnsSwapInit,
  SnsVotingRewardsParameters,
} from "@dfinity/sns";
import {
  candidNumberArrayToBigInt,
  isNullish,
  nonNullish,
  toNullable,
} from "@dfinity/utils";
import { mapOptionalToken } from "./icrc-tokens.utils";
import { isPngAsset } from "./utils";

export const aggregatorCanisterLogoPath = (rootCanisterId: string) =>
  `${SNS_AGGREGATOR_CANISTER_URL}/${AGGREGATOR_CANISTER_VERSION}/sns/root/${rootCanisterId}/logo.png`;

const convertOptionalNumToBigInt = (
  num: number | undefined | null
): bigint | undefined => {
  return num === undefined || num === null ? undefined : BigInt(num);
};

const convertOptionalStringToOptionalPrincipal = (
  principalText: string | null | undefined
): [] | [Principal] => {
  return isNullish(principalText) ? [] : [Principal.fromText(principalText)];
};

const convertFunctionType = (
  functionType: CachedFunctionTypeDto
): SnsFunctionType => {
  if ("NativeNervousSystemFunction" in functionType) {
    return { NativeNervousSystemFunction: {} };
  }
  const { GenericNervousSystemFunction } = functionType;
  return {
    GenericNervousSystemFunction: {
      validator_canister_id: convertOptionalStringToOptionalPrincipal(
        GenericNervousSystemFunction.validator_canister_id
      ),
      target_canister_id: convertOptionalStringToOptionalPrincipal(
        GenericNervousSystemFunction.target_canister_id
      ),
      validator_method_name: toNullable(
        GenericNervousSystemFunction.validator_method_name
      ),
      target_method_name: toNullable(
        GenericNervousSystemFunction.target_method_name
      ),
    },
  };
};

export const convertNervousFunction = ({
  id,
  name,
  description,
  function_type,
}: CachedNervousFunctionDto): SnsNervousSystemFunction => ({
  id: BigInt(id),
  name: name,
  description: toNullable(description),
  function_type: nonNullish(function_type)
    ? toNullable(convertFunctionType(function_type))
    : [],
});

const convertDefaultFollowees = (
  defaultFollowees: undefined | CachedDefaultFolloweesDto
): [] | [SnsDefaultFollowees] => {
  if (isNullish(defaultFollowees)) {
    return [];
  }
  return [
    {
      followees: defaultFollowees.followees.map(([functionId, followees]) => [
        BigInt(functionId),
        followees,
      ]),
    },
  ];
};

const numberToNullableBigInt = (num?: number): [] | [bigint] =>
  toNullable(convertOptionalNumToBigInt(num));

const convertVotingRewardsParameters = (
  votingRewardsParameters: undefined | CachedVotingRewardsParametersDto
): [] | [SnsVotingRewardsParameters] => {
  if (isNullish(votingRewardsParameters)) {
    return [];
  }
  return [
    {
      final_reward_rate_basis_points: numberToNullableBigInt(
        votingRewardsParameters.final_reward_rate_basis_points
      ),
      initial_reward_rate_basis_points: numberToNullableBigInt(
        votingRewardsParameters.initial_reward_rate_basis_points
      ),
      reward_rate_transition_duration_seconds: numberToNullableBigInt(
        votingRewardsParameters.reward_rate_transition_duration_seconds
      ),
      round_duration_seconds: numberToNullableBigInt(
        votingRewardsParameters.round_duration_seconds
      ),
    },
  ];
};

export const convertNervousSystemParameters = ({
  default_followees,
  max_dissolve_delay_seconds,
  max_dissolve_delay_bonus_percentage,
  max_followees_per_function,
  neuron_claimer_permissions,
  neuron_minimum_stake_e8s,
  max_neuron_age_for_age_bonus,
  initial_voting_period_seconds,
  neuron_minimum_dissolve_delay_to_vote_seconds,
  reject_cost_e8s,
  max_proposals_to_keep_per_action,
  wait_for_quiet_deadline_increase_seconds,
  max_number_of_neurons,
  transaction_fee_e8s,
  max_number_of_proposals_with_ballots,
  max_age_bonus_percentage,
  neuron_grantable_permissions,
  voting_rewards_parameters,
  maturity_modulation_disabled,
  max_number_of_principals_per_neuron,
}: CachedNervousSystemParametersDto): SnsNervousSystemParameters => ({
  default_followees: convertDefaultFollowees(default_followees),
  max_dissolve_delay_seconds: numberToNullableBigInt(
    max_dissolve_delay_seconds
  ),
  max_dissolve_delay_bonus_percentage: numberToNullableBigInt(
    max_dissolve_delay_bonus_percentage
  ),
  max_followees_per_function: numberToNullableBigInt(
    max_followees_per_function
  ),
  //
  neuron_claimer_permissions: toNullable(neuron_claimer_permissions),
  neuron_minimum_stake_e8s: numberToNullableBigInt(neuron_minimum_stake_e8s),
  max_neuron_age_for_age_bonus: numberToNullableBigInt(
    max_neuron_age_for_age_bonus
  ),
  initial_voting_period_seconds: numberToNullableBigInt(
    initial_voting_period_seconds
  ),
  neuron_minimum_dissolve_delay_to_vote_seconds: numberToNullableBigInt(
    neuron_minimum_dissolve_delay_to_vote_seconds
  ),
  reject_cost_e8s: numberToNullableBigInt(reject_cost_e8s),
  max_proposals_to_keep_per_action: toNullable(
    max_proposals_to_keep_per_action
  ),
  wait_for_quiet_deadline_increase_seconds: numberToNullableBigInt(
    wait_for_quiet_deadline_increase_seconds
  ),
  max_number_of_neurons: numberToNullableBigInt(max_number_of_neurons),
  transaction_fee_e8s: numberToNullableBigInt(transaction_fee_e8s),
  max_number_of_proposals_with_ballots: numberToNullableBigInt(
    max_number_of_proposals_with_ballots
  ),
  max_age_bonus_percentage: numberToNullableBigInt(max_age_bonus_percentage),
  neuron_grantable_permissions: toNullable(neuron_grantable_permissions),
  voting_rewards_parameters: convertVotingRewardsParameters(
    voting_rewards_parameters
  ),
  maturity_modulation_disabled: toNullable(maturity_modulation_disabled),
  max_number_of_principals_per_neuron: numberToNullableBigInt(
    max_number_of_principals_per_neuron
  ),
});

const convertNeuronsFundParticipationConstraints = (
  constraints: CachedNeuronsFundParticipationConstraints
): SnsNeuronsFundParticipationConstraints => ({
  coefficient_intervals: constraints.coefficient_intervals.map(
    ({
      slope_numerator,
      intercept_icp_e8s,
      from_direct_participation_icp_e8s,
      slope_denominator,
      to_direct_participation_icp_e8s,
    }) => ({
      slope_numerator: toNullable(convertOptionalNumToBigInt(slope_numerator)),
      intercept_icp_e8s: toNullable(
        convertOptionalNumToBigInt(intercept_icp_e8s)
      ),
      from_direct_participation_icp_e8s: toNullable(
        convertOptionalNumToBigInt(from_direct_participation_icp_e8s)
      ),
      slope_denominator: toNullable(
        convertOptionalNumToBigInt(slope_denominator)
      ),
      to_direct_participation_icp_e8s: toNullable(
        convertOptionalNumToBigInt(to_direct_participation_icp_e8s)
      ),
    })
  ),
  max_neurons_fund_participation_icp_e8s: toNullable(
    convertOptionalNumToBigInt(
      constraints.max_neurons_fund_participation_icp_e8s
    )
  ),
  min_direct_participation_threshold_icp_e8s: toNullable(
    convertOptionalNumToBigInt(
      constraints.min_direct_participation_threshold_icp_e8s
    )
  ),
  ideal_matched_participation_function: [],
});

const convertSwapInitParams = (
  init: CachedSwapInitParamsDto | null
): SnsSwapInit | undefined =>
  nonNullish(init)
    ? {
        nns_proposal_id: toNullable(
          convertOptionalNumToBigInt(init.nns_proposal_id)
        ),
        min_participant_icp_e8s: toNullable(
          convertOptionalNumToBigInt(init.min_participant_icp_e8s)
        ),
        neuron_basket_construction_parameters: isNullish(
          init.neuron_basket_construction_parameters
        )
          ? []
          : toNullable({
              dissolve_delay_interval_seconds: BigInt(
                init.neuron_basket_construction_parameters
                  .dissolve_delay_interval_seconds
              ),
              count: BigInt(init.neuron_basket_construction_parameters.count),
            }),
        swap_start_timestamp_seconds: toNullable(
          convertOptionalNumToBigInt(init.swap_start_timestamp_seconds)
        ),
        swap_due_timestamp_seconds: toNullable(
          convertOptionalNumToBigInt(init.swap_due_timestamp_seconds)
        ),
        min_participants: toNullable(init.min_participants),
        sns_token_e8s: toNullable(
          convertOptionalNumToBigInt(init.sns_token_e8s)
        ),
        should_auto_finalize: toNullable(init.should_auto_finalize),
        max_participant_icp_e8s: toNullable(
          convertOptionalNumToBigInt(init.max_participant_icp_e8s)
        ),
        max_icp_e8s: toNullable(convertOptionalNumToBigInt(init.max_icp_e8s)),
        min_icp_e8s: toNullable(convertOptionalNumToBigInt(init.min_icp_e8s)),
        //
        neuron_minimum_stake_e8s: toNullable(
          convertOptionalNumToBigInt(init.neuron_minimum_stake_e8s)
        ),
        transaction_fee_e8s: toNullable(
          convertOptionalNumToBigInt(init.transaction_fee_e8s)
        ),
        confirmation_text: toNullable(init.confirmation_text),
        restricted_countries: toNullable(init.restricted_countries),
        sns_governance_canister_id: init.sns_governance_canister_id,
        sns_ledger_canister_id: init.sns_ledger_canister_id,
        sns_root_canister_id: init.sns_root_canister_id,
        fallback_controller_principal_ids:
          init.fallback_controller_principal_ids,
        nns_governance_canister_id: init.nns_governance_canister_id,
        icp_ledger_canister_id: init.icp_ledger_canister_id,
        neurons_fund_participation_constraints: nonNullish(
          init.neurons_fund_participation_constraints
        )
          ? toNullable(
              convertNeuronsFundParticipationConstraints(
                init.neurons_fund_participation_constraints
              )
            )
          : [],
        min_direct_participation_icp_e8s: toNullable(
          convertOptionalNumToBigInt(init.min_direct_participation_icp_e8s)
        ),
        max_direct_participation_icp_e8s: toNullable(
          convertOptionalNumToBigInt(init.max_direct_participation_icp_e8s)
        ),
        neurons_fund_participation: toNullable(init.neurons_fund_participation),
      }
    : undefined;

const convertSwapParams = (params: CachedSwapParamsDto): SnsParams => ({
  min_participant_icp_e8s: BigInt(params.min_participant_icp_e8s),
  max_icp_e8s: BigInt(params.max_icp_e8s),
  min_icp_e8s: BigInt(params.min_icp_e8s),
  sns_token_e8s: BigInt(params.sns_token_e8s),
  min_participants: params.min_participants,
  max_participant_icp_e8s: BigInt(params.max_participant_icp_e8s),
  swap_due_timestamp_seconds: BigInt(params.swap_due_timestamp_seconds),
  neuron_basket_construction_parameters: toNullable({
    dissolve_delay_interval_seconds: BigInt(
      params.neuron_basket_construction_parameters
        .dissolve_delay_interval_seconds
    ),
    count: BigInt(params.neuron_basket_construction_parameters.count),
  }),
  sale_delay_seconds: toNullable(
    convertOptionalNumToBigInt(params.sale_delay_seconds)
  ),
  min_direct_participation_icp_e8s: toNullable(
    convertOptionalNumToBigInt(params.min_direct_participation_icp_e8s)
  ),
  max_direct_participation_icp_e8s: toNullable(
    convertOptionalNumToBigInt(params.max_direct_participation_icp_e8s)
  ),
});

const convertDerived = ({
  sns_tokens_per_icp,
  buyer_total_icp_e8s,
  cf_participant_count,
  direct_participant_count,
  cf_neuron_count,
  direct_participation_icp_e8s,
  neurons_fund_participation_icp_e8s,
}: CachedSnsSwapDerivedDto): SnsSwapDerivedState => ({
  sns_tokens_per_icp,
  buyer_total_icp_e8s: BigInt(buyer_total_icp_e8s),
  cf_participant_count: nonNullish(cf_participant_count)
    ? toNullable(BigInt(cf_participant_count))
    : [],
  direct_participant_count: nonNullish(direct_participant_count)
    ? toNullable(BigInt(direct_participant_count))
    : [],
  cf_neuron_count: nonNullish(cf_neuron_count)
    ? toNullable(BigInt(cf_neuron_count))
    : [],
  direct_participation_icp_e8s: toNullable(
    convertOptionalNumToBigInt(direct_participation_icp_e8s)
  ),
  neurons_fund_participation_icp_e8s: toNullable(
    convertOptionalNumToBigInt(neurons_fund_participation_icp_e8s)
  ),
});

export const convertIcrc1Metadata = (
  icrc1Metadata: CachedSnsTokenMetadataDto
): IcrcTokenMetadataResponse => {
  return icrc1Metadata.map(([key, value]) => {
    if ("Int" in value) {
      return [key, { Int: candidNumberArrayToBigInt(value.Int) }];
    }
    if ("Nat" in value) {
      return [key, { Nat: candidNumberArrayToBigInt(value.Nat) }];
    }
    return [key, value];
  });
};

/**
 * Metadata is given only if all its properties are defined.
 */
const convertDtoToSnsSummaryMetadata = (
  { url, name, description }: CachedSnsMetadataDto,
  rootCanisterId: string
): SnsSummaryMetadata | undefined => {
  const nullishLogo = aggregatorCanisterLogoPath(rootCanisterId);

  if (isNullish(url) || isNullish(name) || isNullish(description)) {
    return undefined;
  }

  // We have to check if the logo is a png asset for security reasons.
  // Default logo can be svg.
  return {
    logo: isPngAsset(nullishLogo) ? nullishLogo : DEFAULT_SNS_LOGO,
    url,
    name,
    description,
  };
};

/**
 * Token metadata is given only if all IcrcTokenMetadata properties are defined.
 */
export const convertDtoToTokenMetadata = (
  data: CachedSnsTokenMetadataDto
): IcrcTokenMetadata | undefined =>
  mapOptionalToken(convertIcrc1Metadata(data));

const convertDtoToSnsSummarySwap = (
  swap: CachedSnsSwapDto
): SnsSummarySwap | undefined => {
  if (isNullish(swap.params)) {
    return undefined;
  }
  return {
    auto_finalize_swap_response: [],
    already_tried_to_auto_finalize: [],
    lifecycle: swap.lifecycle,
    // TODO: Ask to Max, why isn't it there?
    neuron_recipes: [],
    // TODO: extend when needed
    next_ticket_id: [],
    purge_old_tickets_last_completion_timestamp_nanoseconds: [],
    purge_old_tickets_next_principal: [],
    // TODO: Ask to Max, why isn't it there?
    cf_participants: [],
    decentralization_sale_open_timestamp_seconds: convertOptionalNumToBigInt(
      swap.decentralization_sale_open_timestamp_seconds
    ),
    // TODO: Upgrade @dfinity/utils and use the fix for the optional boolean
    finalize_swap_in_progress:
      swap.finalize_swap_in_progress === undefined
        ? []
        : [swap.finalize_swap_in_progress],
    buyers: [],
    open_sns_token_swap_proposal_id:
      swap.open_sns_token_swap_proposal_id !== undefined
        ? toNullable(
            convertOptionalNumToBigInt(swap.open_sns_token_swap_proposal_id)
          )
        : [],
    init: toNullable(convertSwapInitParams(swap.init)),
    params: convertSwapParams(swap.params),
    direct_participation_icp_e8s: toNullable(
      convertOptionalNumToBigInt(swap.direct_participation_icp_e8s)
    ),
    neurons_fund_participation_icp_e8s: toNullable(
      convertOptionalNumToBigInt(swap.neurons_fund_participation_icp_e8s)
    ),
  };
};

const convertDtoToLifecycle = (
  data: CachedLifecycleResponseDto | null
): SnsGetLifecycleResponse | undefined => {
  if (isNullish(data)) {
    return undefined;
  }
  return {
    decentralization_sale_open_timestamp_seconds: toNullable(
      convertOptionalNumToBigInt(
        data.decentralization_sale_open_timestamp_seconds
      )
    ),
    lifecycle: toNullable(data.lifecycle),
    // TODO: Add support in SNS Aggregator for these fields
    decentralization_swap_termination_timestamp_seconds: [],
  };
};

type PartialSummary = Omit<
  SnsSummary,
  "metadata" | "token" | "swap" | "init" | "swapParams" | "lifecycle"
> & {
  metadata?: SnsSummaryMetadata;
  token?: IcrcTokenMetadata;
  swap?: SnsSummarySwap;
  init?: SnsSwapInit;
  swapParams?: SnsParams;
  lifecycle?: SnsGetLifecycleResponse;
};

const isValidSummary = (entry: PartialSummary): entry is SnsSummary =>
  nonNullish(entry.metadata) &&
  nonNullish(entry.token) &&
  nonNullish(entry.swap) &&
  nonNullish(entry.init) &&
  nonNullish(entry.swapParams) &&
  nonNullish(entry.lifecycle);

export const convertDtoToSnsSummary = ({
  canister_ids: {
    root_canister_id,
    swap_canister_id,
    governance_canister_id,
    ledger_canister_id,
    index_canister_id,
  },
  meta,
  icrc1_metadata,
  swap_state,
  derived_state,
  init,
  swap_params,
  lifecycle,
}: CachedSnsDto): SnsSummaryWrapper | undefined => {
  const partialSummary: PartialSummary = {
    rootCanisterId: Principal.from(root_canister_id),
    swapCanisterId: Principal.from(swap_canister_id),
    governanceCanisterId: Principal.from(governance_canister_id),
    ledgerCanisterId: Principal.from(ledger_canister_id),
    indexCanisterId: Principal.from(index_canister_id),
    metadata: convertDtoToSnsSummaryMetadata(meta, root_canister_id),
    token: convertDtoToTokenMetadata(icrc1_metadata),
    swap: convertDtoToSnsSummarySwap(swap_state.swap),
    derived: convertDerived(derived_state),
    init: convertSwapInitParams(init.init),
    swapParams: nonNullish(swap_params.params)
      ? convertSwapParams(swap_params.params)
      : undefined,
    lifecycle: convertDtoToLifecycle(lifecycle),
  };

  return isValidSummary(partialSummary)
    ? new SnsSummaryWrapper(partialSummary)
    : undefined;
};
