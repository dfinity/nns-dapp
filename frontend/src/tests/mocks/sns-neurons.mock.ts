import {
  SECONDS_IN_DAY,
  SECONDS_IN_HOUR,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import type { ProjectNeuronStore } from "$lib/stores/sns-neurons.store";
import type { SnsParameters } from "$lib/stores/sns-parameters.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { enumValues } from "$lib/utils/enum.utils";
import { convertNervousSystemParameters } from "$lib/utils/sns-aggregator-converters.utils";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
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
  id = [1, 5, 3, 9, 9, 3, 2],
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
  id?: number[];
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

export const mockSnsNeuron = createMockSnsNeuron({});

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

export const snsNervousSystemParametersMock: SnsNervousSystemParameters =
  convertNervousSystemParameters(
    aggregatorSnsMockDto.nervous_system_parameters
  );

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
