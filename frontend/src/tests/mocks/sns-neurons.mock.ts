import type { ProjectNeuronStore } from "$lib/stores/sns-neurons.store";
import type { SnsParameters } from "$lib/stores/sns-parameters.store";
import { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type {
  NervousSystemParameters,
  SnsNeuron,
  SnsNeuronPermissionType,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import type { Subscriber } from "svelte/store";
import { mockIdentity } from "./auth.store.mock";
import { rootCanisterIdMock } from "./sns.api.mock";

export const mockSnsNeuronTimestampSeconds = 3600 * 24 * 6;

export const createMockSnsNeuron = ({
  stake = BigInt(1_000_000_000),
  id,
  state,
}: {
  stake?: bigint;
  id: number[];
  state?: NeuronState;
}): SnsNeuron => ({
  id: [{ id: arrayOfNumberToUint8Array(id) }],
  permissions: [],
  source_nns_neuron_id: [],
  maturity_e8s_equivalent: BigInt(1),
  cached_neuron_stake_e8s: stake,
  created_timestamp_seconds: BigInt(
    Math.floor(Date.now() / 1000 - mockSnsNeuronTimestampSeconds)
  ),
  staked_maturity_e8s_equivalent: [BigInt(2)],
  auto_stake_maturity: [],
  aging_since_timestamp_seconds: BigInt(100),
  voting_power_percentage_multiplier: BigInt(1),
  dissolve_state:
    state === undefined
      ? []
      : [
          state === NeuronState.Dissolving
            ? {
                WhenDissolvedTimestampSeconds: BigInt(
                  Math.floor(Date.now() / 1000 + 3600 * 24 * 365 * 2)
                ),
              }
            : {
                DissolveDelaySeconds: BigInt(Math.floor(3600 * 24 * 365 * 2)),
              },
        ],
  followees: [],
  neuron_fees_e8s: BigInt(0),
});

export const mockSnsNeuron = createMockSnsNeuron({
  stake: BigInt(1_000_000_000),
  id: [1, 5, 3, 9, 9, 3, 2],
});

export const mockSnsNeuronWithPermissions = (
  permissions: SnsNeuronPermissionType[]
): SnsNeuron => ({
  ...createMockSnsNeuron({
    stake: BigInt(1_000_000_000),
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

export const snsNervousSystemParametersMock: NervousSystemParameters = {
  default_followees: [
    {
      followees: [],
    },
  ],
  max_dissolve_delay_seconds: [3155760000n],
  max_dissolve_delay_bonus_percentage: [100n],
  max_followees_per_function: [15n],
  neuron_claimer_permissions: [
    {
      permissions: Int32Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    },
  ],
  neuron_minimum_stake_e8s: [100000000n],
  max_neuron_age_for_age_bonus: [15778800n],
  initial_voting_period_seconds: [345600n],
  neuron_minimum_dissolve_delay_to_vote_seconds: [2629800n],
  reject_cost_e8s: [100000000n],
  max_proposals_to_keep_per_action: [100],
  wait_for_quiet_deadline_increase_seconds: [86400n],
  max_number_of_neurons: [200000n],
  transaction_fee_e8s: [10000n],
  max_number_of_proposals_with_ballots: [700n],
  max_age_bonus_percentage: [25n],
  neuron_grantable_permissions: [
    {
      permissions: Int32Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    },
  ],
  voting_rewards_parameters: [
    {
      final_reward_rate_basis_points: [0n],
      initial_reward_rate_basis_points: [0n],
      reward_rate_transition_duration_seconds: [31557600n],
      round_duration_seconds: [86400n],
    },
  ],
  max_number_of_principals_per_neuron: [5n],
};

export const mockSnsParametersStore = (
  run: Subscriber<{ [rootCanisterId: string]: SnsParameters }>
): (() => void) => {
  run({
    [rootCanisterIdMock.toText()]: {
      parameters: snsNervousSystemParametersMock,
      certified: true,
    },
  });
  return () => undefined;
};
