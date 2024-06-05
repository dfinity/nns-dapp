import {
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import type { ProjectNeuronStore } from "$lib/stores/sns-neurons.store";
import type { SnsParameters } from "$lib/stores/sns-parameters.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { enumValues } from "$lib/utils/enum.utils";
import { NeuronState, type NeuronId } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  type SnsNervousSystemParameters,
  type SnsNeuron,
} from "@dfinity/sns";
import type {
  DisburseMaturityInProgress,
  NeuronPermission,
} from "@dfinity/sns/dist/candid/sns_governance";
import {
  arrayOfNumberToUint8Array,
  isNullish,
  nonNullish,
} from "@dfinity/utils";
import type { Subscriber } from "svelte/store";
import { mockIdentity, mockPrincipal } from "./auth.store.mock";
import { rootCanisterIdMock } from "./sns.api.mock";

export const mockSnsNeuronTimestampSeconds = 3600 * 24 * 6;

export const mockActiveDisbursement: DisburseMaturityInProgress = {
  timestamp_of_disbursement_seconds: 10_000n,
  amount_e8s: 1_000_000n,
  account_to_disburse_to: [
    {
      owner: [mockPrincipal],
      subaccount: [],
    },
  ],
  finalize_disbursement_timestamp_seconds: [],
};

export const createMockSnsNeuron = ({
  stake = 1_000_000_000n,
  id,
  state,
  permissions = [],
  vesting,
  votingPowerMultiplier = 100n,
  dissolveDelaySeconds,
  whenDissolvedTimestampSeconds = BigInt(
    Math.floor(Date.now() / 1000 + 3600 * 24 * 365 * 2)
  ),
  ageSinceTimestampSeconds = 1_000n,
  stakedMaturity = 100_000_000n,
  maturity = 100_000_000n,
  createdTimestampSeconds = BigInt(nowInSeconds() - SECONDS_IN_DAY),
  sourceNnsNeuronId,
  activeDisbursementsE8s = [],
}: {
  stake?: bigint;
  id: number[];
  state?: NeuronState;
  permissions?: NeuronPermission[];
  // `undefined` means no vesting at all (default)
  // `true` means is still vesting
  // `false` means vesting period has passed
  vesting?: boolean;
  votingPowerMultiplier?: bigint;
  dissolveDelaySeconds?: bigint;
  whenDissolvedTimestampSeconds?: bigint;
  ageSinceTimestampSeconds?: bigint;
  stakedMaturity?: bigint;
  maturity?: bigint;
  createdTimestampSeconds?: bigint;
  // Having a sourceNnsNeuronId makes the neuron a CF neuron.
  sourceNnsNeuronId?: NeuronId;
  activeDisbursementsE8s?: bigint[];
}): SnsNeuron => {
  if (isNullish(state) && nonNullish(dissolveDelaySeconds)) {
    state = NeuronState.Locked;
  } else if (
    nonNullish(state) &&
    state !== NeuronState.Dissolved &&
    isNullish(dissolveDelaySeconds)
  ) {
    dissolveDelaySeconds = BigInt(Math.floor(3600 * 24 * 365 * 2));
  }
  return {
    id: [{ id: arrayOfNumberToUint8Array(id) }],
    permissions,
    source_nns_neuron_id: isNullish(sourceNnsNeuronId)
      ? []
      : [sourceNnsNeuronId],
    maturity_e8s_equivalent: maturity,
    cached_neuron_stake_e8s: stake,
    created_timestamp_seconds: createdTimestampSeconds,
    staked_maturity_e8s_equivalent: [stakedMaturity],
    auto_stake_maturity: [],
    aging_since_timestamp_seconds: ageSinceTimestampSeconds,
    voting_power_percentage_multiplier: votingPowerMultiplier,
    dissolve_state:
      state === undefined || state === NeuronState.Dissolved
        ? []
        : [
            state === NeuronState.Dissolving
              ? {
                  WhenDissolvedTimestampSeconds: whenDissolvedTimestampSeconds,
                }
              : {
                  DissolveDelaySeconds: dissolveDelaySeconds,
                },
          ],
    followees: [],
    neuron_fees_e8s: 0n,
    vesting_period_seconds:
      vesting === undefined
        ? []
        : vesting
        ? [BigInt(SECONDS_IN_MONTH)]
        : [BigInt(SECONDS_IN_HOUR)],
    disburse_maturity_in_progress: activeDisbursementsE8s.map((amountE8s) => ({
      ...mockActiveDisbursement,
      amount_e8s: amountE8s,
    })),
  };
};

export const mockSnsNeuronId = {
  id: arrayOfNumberToUint8Array([1, 5, 3, 9, 9, 3, 2]),
};

export const mockSnsNeuron = createMockSnsNeuron({
  stake: 1_000_000_000n,
  id: [1, 5, 3, 9, 9, 3, 2],
});

export const mockSnsNeuronWithPermissions = (
  permissions: SnsNeuronPermissionType[]
): SnsNeuron => ({
  ...createMockSnsNeuron({
    stake: 1_000_000_000n,
    id: [1, 5, 3, 9, 9, 3, 2],
  }),
  permissions: [
    {
      principal: [mockIdentity.getPrincipal()],
      permission_type: Int32Array.from(permissions),
    },
  ],
});

export const buildMockSnsNeuronsStoreSubscribe =
  ({
    neurons,
    rootCanisterId,
  }: {
    neurons: SnsNeuron[];
    rootCanisterId: Principal;
  }) =>
  (
    run: Subscriber<{ [rootCanisterId: string]: ProjectNeuronStore }>
  ): (() => void) => {
    run({
      [rootCanisterId.toText()]: {
        neurons,
        certified: true,
      },
    });
    return () => undefined;
  };

export const buildMockSortedSnsNeuronsStoreSubscribe =
  (neurons: SnsNeuron[] = []) =>
  (run: Subscriber<SnsNeuron[]>): (() => void) => {
    run(neurons);
    return () => undefined;
  };

export const snsNervousSystemParametersMock: SnsNervousSystemParameters = {
  default_followees: [
    {
      followees: [[0n, { followees: [mockSnsNeuronId] }]],
    },
  ],
  max_dissolve_delay_seconds: [3_155_760_000n],
  max_dissolve_delay_bonus_percentage: [100n],
  max_followees_per_function: [15n],
  neuron_claimer_permissions: [
    {
      permissions: Int32Array.from(enumValues(SnsNeuronPermissionType)),
    },
  ],
  neuron_minimum_stake_e8s: [100_000_000n],
  max_neuron_age_for_age_bonus: [15_778_800n],
  initial_voting_period_seconds: [345_600n],
  neuron_minimum_dissolve_delay_to_vote_seconds: [2_629_800n],
  reject_cost_e8s: [100_000_000n],
  max_proposals_to_keep_per_action: [100],
  wait_for_quiet_deadline_increase_seconds: [86_400n],
  max_number_of_neurons: [200_000n],
  transaction_fee_e8s: [10_000n],
  max_number_of_proposals_with_ballots: [700n],
  max_age_bonus_percentage: [25n],
  neuron_grantable_permissions: [
    {
      permissions: Int32Array.from(enumValues(SnsNeuronPermissionType)),
    },
  ],
  voting_rewards_parameters: [
    {
      final_reward_rate_basis_points: [0n],
      initial_reward_rate_basis_points: [0n],
      reward_rate_transition_duration_seconds: [31_557_600n],
      round_duration_seconds: [86_400n],
    },
  ],
  max_number_of_principals_per_neuron: [5n],
  maturity_modulation_disabled: [false],
};

export const buildMockSnsParametersStore =
  (notDefined = false) =>
  (
    run: Subscriber<{ [rootCanisterId: string]: SnsParameters }>
  ): (() => void) => {
    run(
      notDefined
        ? undefined
        : {
            [rootCanisterIdMock.toText()]: {
              parameters: snsNervousSystemParametersMock,
              certified: true,
            },
          }
    );
    return () => undefined;
  };

export const allSnsNeuronPermissions = Int32Array.from(
  enumValues(SnsNeuronPermissionType)
);
