import { bigIntMax } from "$lib/utils/bigInt.utils";
import { nowInSeconds } from "$lib/utils/date.utils";
import {
  getDissolvingTimeInSeconds,
  getLockedTimeInSeconds,
  hasAutoStakeMaturityOn,
} from "$lib/utils/neuron.utils";
import {
  getSnsDissolvingTimeInSeconds,
  getSnsLockedTimeInSeconds,
  getSnsNeuronState,
  hasAutoStakeMaturityOn as hasAutoStakeMaturityOnSns,
} from "$lib/utils/sns-neuron.utils";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";

export type AgnosticNeuron = NeuronInfo | SnsNeuron;

export const isNnsNeuron = (neuron: AgnosticNeuron): neuron is NeuronInfo => {
  return neuron && "neuronId" in neuron;
};

export const isSnsNeuron = (neuron: AgnosticNeuron): neuron is SnsNeuron => {
  return !isNnsNeuron(neuron);
};

export const getNeuronFreeMaturityE8s = (neuron: AgnosticNeuron): bigint => {
  if (isNnsNeuron(neuron)) {
    return neuron.fullNeuron?.maturityE8sEquivalent ?? 0n;
  } else {
    return neuron.maturity_e8s_equivalent;
  }
};

export const getNeuronStakedMaturityE8s = (neuron: AgnosticNeuron): bigint => {
  if (isNnsNeuron(neuron)) {
    return neuron.fullNeuron?.stakedMaturityE8sEquivalent ?? 0n;
  } else {
    return neuron.staked_maturity_e8s_equivalent[0] ?? 0n;
  }
};

export const getNeuronTotalMaturityE8s = (neuron: AgnosticNeuron): bigint => {
  return getNeuronFreeMaturityE8s(neuron) + getNeuronStakedMaturityE8s(neuron);
};

export const getNeuronStakeE8s = (neuron: AgnosticNeuron): bigint => {
  if (isNnsNeuron(neuron)) {
    return neuron.fullNeuron?.cachedNeuronStake ?? 0n;
  } else {
    return neuron.cached_neuron_stake_e8s;
  }
};

export const getNeuronFees = (neuron: AgnosticNeuron): bigint => {
  if (isNnsNeuron(neuron)) {
    return neuron.fullNeuron?.neuronFees ?? 0n;
  } else {
    return neuron.neuron_fees_e8s;
  }
};

export const getNeuronStakeAfterFeesE8s = (neuron: AgnosticNeuron): bigint => {
  return bigIntMax(getNeuronStakeE8s(neuron) - getNeuronFees(neuron), 0n);
};

export const getNeuronTotalStakeAfterFeesE8s = (
  neuron: AgnosticNeuron
): bigint => {
  return (
    getNeuronStakeAfterFeesE8s(neuron) + getNeuronStakedMaturityE8s(neuron)
  );
};

export const getNeuronTotalValueAfterFeesE8s = (
  neuron: AgnosticNeuron
): bigint => {
  return (
    getNeuronTotalStakeAfterFeesE8s(neuron) + getNeuronFreeMaturityE8s(neuron)
  );
};

export const getNeuronIsAutoStakingMaturity = (
  neuron: AgnosticNeuron
): boolean => {
  if (isNnsNeuron(neuron)) {
    return hasAutoStakeMaturityOn(neuron);
  } else {
    return hasAutoStakeMaturityOnSns(neuron);
  }
};

export const getNeuronIsDissolving = (neuron: AgnosticNeuron): boolean => {
  if (isNnsNeuron(neuron)) {
    return neuron.state === NeuronState.Dissolving;
  } else {
    return getSnsNeuronState(neuron) === NeuronState.Dissolving;
  }
};

export const getNeuronDissolveDelaySeconds = (
  neuron: AgnosticNeuron,
  referenceDate?: Date
): bigint => {
  if (getNeuronIsDissolving(neuron)) {
    if (isNnsNeuron(neuron)) {
      return getDissolvingTimeInSeconds(neuron, referenceDate) ?? 0n;
    } else {
      return getSnsDissolvingTimeInSeconds(neuron, referenceDate) ?? 0n;
    }
  } else {
    if (isNnsNeuron(neuron)) {
      return getLockedTimeInSeconds(neuron) ?? 0n;
    } else {
      return getSnsLockedTimeInSeconds(neuron) ?? 0n;
    }
  }
};

export const getNeuronAgeSeconds = (
  neuron: AgnosticNeuron,
  referenceDate: Date = new Date()
): number => {
  if (getNeuronIsDissolving(neuron)) {
    return 0;
  }

  let agingSinceTimestampSeconds: number;
  if (isNnsNeuron(neuron)) {
    agingSinceTimestampSeconds = Number(
      neuron.fullNeuron?.agingSinceTimestampSeconds ?? 0
    );
  } else {
    agingSinceTimestampSeconds = Number(neuron.aging_since_timestamp_seconds);
  }

  return Math.max(
    referenceDate.getTime() / 1000 - agingSinceTimestampSeconds,
    0
  );
};

export const isNeuronEligibleToVote = (
  neuron: AgnosticNeuron,
  minimumStakeE8s: bigint,
  minDissolveDelaySeconds: bigint,
  referenceDate?: Date
): boolean =>
  getNeuronStakeE8s(neuron) >= minimumStakeE8s &&
  getNeuronDissolveDelaySeconds(neuron, referenceDate) >=
    minDissolveDelaySeconds;

export const maximiseNeuronParams = (
  neuron: AgnosticNeuron,
  maxDissolveSeconds: number
) => {
  const maxDissolve = BigInt(maxDissolveSeconds);

  if (isNnsNeuron(neuron)) {
    if (neuron.fullNeuron) {
      if (getNeuronIsDissolving(neuron)) {
        neuron.fullNeuron.agingSinceTimestampSeconds = BigInt(nowInSeconds());
      }
      neuron.fullNeuron.dissolveState = {
        DissolveDelaySeconds: maxDissolve,
      };
      neuron.fullNeuron.stakedMaturityE8sEquivalent =
        getNeuronTotalMaturityE8s(neuron);
      neuron.fullNeuron.maturityE8sEquivalent = 0n;
      neuron.fullNeuron.autoStakeMaturity = true;
    }
    neuron.state = NeuronState.Locked;
    neuron.dissolveDelaySeconds = maxDissolve;
  } else {
    if (getNeuronIsDissolving(neuron)) {
      neuron.aging_since_timestamp_seconds = BigInt(nowInSeconds());
    }
    neuron.dissolve_state = [
      {
        DissolveDelaySeconds: maxDissolve,
      },
    ];
    neuron.staked_maturity_e8s_equivalent = [getNeuronTotalMaturityE8s(neuron)];
    neuron.maturity_e8s_equivalent = 0n;
    neuron.auto_stake_maturity = [true];
  }
};

export const getNeuronBonusRatio = (
  neuron: AgnosticNeuron,
  params: {
    dissolveMax: number;
    dissolveBonus: number;
    ageMax: number;
    ageBonus: number;
    referenceDate: Date;
  }
) => {
  const { dissolveMax, dissolveBonus, ageMax, ageBonus, referenceDate } =
    params;
  const ageSeconds = getNeuronAgeSeconds(neuron, referenceDate);
  const agingBonus = Math.min(ageSeconds / ageMax, 1) * ageBonus;

  const dissolveSeconds = getNeuronDissolveDelaySeconds(neuron, referenceDate);
  const dissolvingBonus =
    Math.min(Number(dissolveSeconds) / dissolveMax, 1) * dissolveBonus;
  return dissolvingBonus + agingBonus;
};

export const cloneNeurons = (neurons: AgnosticNeuron[]) => {
  if (isNnsNeuron(neurons[0])) {
    return (neurons as NeuronInfo[]).map((n) => ({
      ...n,
      fullNeuron: n.fullNeuron ? { ...n.fullNeuron } : undefined,
    })) as NeuronInfo[];
  } else {
    return (neurons as SnsNeuron[]).map((n) => ({
      ...n,
      dissolve_state: n.dissolve_state ? [...n.dissolve_state] : [],
      staked_maturity_e8s_equivalent: [...n.staked_maturity_e8s_equivalent],
    })) as SnsNeuron[];
  }
};

export const increaseNeuronMaturity = (
  neuron: AgnosticNeuron,
  maturityE8s: bigint
) => {
  if (getNeuronIsAutoStakingMaturity(neuron)) {
    const newTotal = getNeuronStakedMaturityE8s(neuron) + maturityE8s;
    if (isNnsNeuron(neuron)) {
      neuron.fullNeuron!.stakedMaturityE8sEquivalent = newTotal;
    } else {
      neuron.staked_maturity_e8s_equivalent = [newTotal];
    }
  } else {
    const newTotal = getNeuronFreeMaturityE8s(neuron) + maturityE8s;
    if (isNnsNeuron(neuron)) {
      neuron.fullNeuron!.maturityE8sEquivalent = newTotal;
    } else {
      neuron.maturity_e8s_equivalent = newTotal;
    }
  }
};
