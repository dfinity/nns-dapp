import { nonNullish } from "$lib/utils/utils";
import type { SnsNeuronPermissionType } from "@dfinity/sns";
import type {
  DefaultFollowees,
  NervousSystemParameters,
  NeuronId,
  NeuronPermissionList,
  VotingRewardsParameters,
} from "@dfinity/sns/dist/candid/sns_governance";
import { fromDefinedNullable } from "@dfinity/utils";

interface DefaultFolloweeMap {
  functionId: bigint;
  followees: NeuronId[];
}

interface VotingRewardsParametersMap {
  final_reward_rate_basis_points: bigint;
  initial_reward_rate_basis_points: bigint;
  reward_rate_transition_duration_seconds: bigint;
  round_duration_seconds: bigint;
}

interface NervousSystemParametersMap {
  default_followees: DefaultFolloweeMap[];
  max_dissolve_delay_seconds: bigint;
  max_dissolve_delay_bonus_percentage: bigint;
  max_followees_per_function: bigint;
  neuron_claimer_permissions: SnsNeuronPermissionType[];
  neuron_minimum_stake_e8s: bigint;
  max_neuron_age_for_age_bonus: bigint;
  initial_voting_period_seconds: bigint;
  neuron_minimum_dissolve_delay_to_vote_seconds: bigint;
  reject_cost_e8s: bigint;
  max_proposals_to_keep_per_action: number;
  wait_for_quiet_deadline_increase_seconds: bigint;
  max_number_of_neurons: bigint;
  transaction_fee_e8s: bigint;
  max_number_of_proposals_with_ballots: bigint;
  max_age_bonus_percentage: bigint;
  neuron_grantable_permissions: SnsNeuronPermissionType[];
  voting_rewards_parameters: VotingRewardsParametersMap;
  max_number_of_principals_per_neuron: bigint;
}

const getDefaultFollowees = (
  followees: DefaultFollowees
): DefaultFolloweeMap[] =>
  followees.followees.map(([functionId, { followees }]) => ({
    functionId,
    followees,
  }));

const getPermissions = (
  permissionList: NeuronPermissionList
): SnsNeuronPermissionType[] =>
  nonNullish(permissionList?.permissions)
    ? Array.from(permissionList.permissions)
    : permissionList?.permissions;

const getRewardsParameters = (
  rewardsParameters: VotingRewardsParameters
): VotingRewardsParametersMap => ({
  final_reward_rate_basis_points: fromDefinedNullable(
    rewardsParameters.final_reward_rate_basis_points
  ),
  initial_reward_rate_basis_points: fromDefinedNullable(
    rewardsParameters.initial_reward_rate_basis_points
  ),
  reward_rate_transition_duration_seconds: fromDefinedNullable(
    rewardsParameters.reward_rate_transition_duration_seconds
  ),
  round_duration_seconds: fromDefinedNullable(
    rewardsParameters.round_duration_seconds
  ),
});

// TODO: move to ic-js
export const mapNervousSystemParameters = (
  parameters: NervousSystemParameters
): NervousSystemParametersMap => ({
  default_followees: getDefaultFollowees(
    fromDefinedNullable(parameters.default_followees)
  ),
  max_dissolve_delay_seconds: fromDefinedNullable(
    parameters.max_dissolve_delay_seconds
  ),
  max_dissolve_delay_bonus_percentage: fromDefinedNullable(
    parameters.max_dissolve_delay_bonus_percentage
  ),
  max_followees_per_function: fromDefinedNullable(
    parameters.max_followees_per_function
  ),
  neuron_claimer_permissions: getPermissions(
    fromDefinedNullable(parameters.neuron_claimer_permissions)
  ),
  neuron_minimum_stake_e8s: fromDefinedNullable(
    parameters.neuron_minimum_stake_e8s
  ),
  max_neuron_age_for_age_bonus: fromDefinedNullable(
    parameters.max_neuron_age_for_age_bonus
  ),
  initial_voting_period_seconds: fromDefinedNullable(
    parameters.initial_voting_period_seconds
  ),
  neuron_minimum_dissolve_delay_to_vote_seconds: fromDefinedNullable(
    parameters.neuron_minimum_dissolve_delay_to_vote_seconds
  ),
  reject_cost_e8s: fromDefinedNullable(parameters.reject_cost_e8s),
  max_proposals_to_keep_per_action: fromDefinedNullable(
    parameters.max_proposals_to_keep_per_action
  ),
  wait_for_quiet_deadline_increase_seconds: fromDefinedNullable(
    parameters.wait_for_quiet_deadline_increase_seconds
  ),
  max_number_of_neurons: fromDefinedNullable(parameters.max_number_of_neurons),
  transaction_fee_e8s: fromDefinedNullable(parameters.transaction_fee_e8s),
  max_number_of_proposals_with_ballots: fromDefinedNullable(
    parameters.max_number_of_proposals_with_ballots
  ),
  max_age_bonus_percentage: fromDefinedNullable(
    parameters.max_age_bonus_percentage
  ),
  neuron_grantable_permissions: getPermissions(
    fromDefinedNullable(parameters.neuron_grantable_permissions)
  ),
  voting_rewards_parameters: getRewardsParameters(
    fromDefinedNullable(parameters.voting_rewards_parameters)
  ),
  max_number_of_principals_per_neuron: fromDefinedNullable(
    parameters.max_number_of_principals_per_neuron
  ),
});
