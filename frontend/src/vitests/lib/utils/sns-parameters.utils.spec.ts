import { enumValues } from "$lib/utils/enum.utils";
import { mapNervousSystemParameters } from "$lib/utils/sns-parameters.utils";
import {
  mockSnsNeuronId,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronPermissionType } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";

describe("sns-parameters utils", () => {
  describe("mapNervousSystemParameters", () => {
    it("should map primitive parameters", () => {
      const {
        max_dissolve_delay_seconds,
        max_dissolve_delay_bonus_percentage,
        max_followees_per_function,
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
        max_number_of_principals_per_neuron,
      } = mapNervousSystemParameters(snsNervousSystemParametersMock);
      expect(max_dissolve_delay_seconds).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_dissolve_delay_seconds
        )
      );
      expect(max_dissolve_delay_bonus_percentage).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_dissolve_delay_bonus_percentage
        )
      );
      expect(max_followees_per_function).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_followees_per_function
        )
      );
      expect(neuron_minimum_stake_e8s).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.neuron_minimum_stake_e8s
        )
      );
      expect(max_neuron_age_for_age_bonus).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_neuron_age_for_age_bonus
        )
      );
      expect(initial_voting_period_seconds).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.initial_voting_period_seconds
        )
      );
      expect(neuron_minimum_dissolve_delay_to_vote_seconds).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.neuron_minimum_dissolve_delay_to_vote_seconds
        )
      );
      expect(reject_cost_e8s).toEqual(
        fromDefinedNullable(snsNervousSystemParametersMock.reject_cost_e8s)
      );
      expect(max_proposals_to_keep_per_action).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_proposals_to_keep_per_action
        )
      );
      expect(wait_for_quiet_deadline_increase_seconds).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.wait_for_quiet_deadline_increase_seconds
        )
      );
      expect(max_number_of_neurons).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_number_of_neurons
        )
      );
      expect(transaction_fee_e8s).toEqual(
        fromDefinedNullable(snsNervousSystemParametersMock.transaction_fee_e8s)
      );
      expect(max_number_of_proposals_with_ballots).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_number_of_proposals_with_ballots
        )
      );
      expect(max_age_bonus_percentage).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_age_bonus_percentage
        )
      );
      expect(max_number_of_principals_per_neuron).toEqual(
        fromDefinedNullable(
          snsNervousSystemParametersMock.max_number_of_principals_per_neuron
        )
      );
    });

    it("should transform permissions", () => {
      const { neuron_claimer_permissions, neuron_grantable_permissions } =
        mapNervousSystemParameters(snsNervousSystemParametersMock);
      expect(neuron_claimer_permissions).toEqual(
        enumValues(SnsNeuronPermissionType)
      );
      expect(neuron_grantable_permissions).toEqual(
        enumValues(SnsNeuronPermissionType)
      );
    });

    it("should transform followees", () => {
      const { default_followees } = mapNervousSystemParameters(
        snsNervousSystemParametersMock
      );
      expect(default_followees[0].functionId).toEqual(0n);
      expect(default_followees[0].followees).toEqual([mockSnsNeuronId]);
    });
    it("should transform rewards parameters", () => {
      const { voting_rewards_parameters } = mapNervousSystemParameters(
        snsNervousSystemParametersMock
      );
      expect(voting_rewards_parameters).toEqual({
        final_reward_rate_basis_points: 0n,
        initial_reward_rate_basis_points: 0n,
        reward_rate_transition_duration_seconds: 31557600n,
        round_duration_seconds: 86400n,
      });
    });
  });
});
