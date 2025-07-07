import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { bigIntMax } from "./bigInt.utils";
import { nowInSeconds } from "./date.utils";
import {
  getDissolvingTimeInSeconds,
  getLockedTimeInSeconds,
  hasAutoStakeMaturityOn,
} from "./neuron.utils";
import {
  getSnsDissolvingTimeInSeconds,
  getSnsLockedTimeInSeconds,
  getSnsNeuronState,
  hasAutoStakeMaturityOn as hasAutoStakeMaturityOnSns,
} from "./sns-neuron.utils";

export type AgnosticNeuron = NeuronInfo | SnsNeuron;

export const isNnsNeuron = (neuron: AgnosticNeuron): neuron is NeuronInfo => {
  return neuron && "neuronId" in neuron;
};

export const isSnsNeuron = (neuron: AgnosticNeuron): neuron is SnsNeuron => {
  return !isNnsNeuron(neuron);
};

export const getNueronFreeMaturityE8s = (neuron: AgnosticNeuron): bigint => {
  if (isNnsNeuron(neuron)) {
    return neuron.fullNeuron?.maturityE8sEquivalent ?? 0n;
  } else {
    return neuron.maturity_e8s_equivalent;
  }
};

export const getNueronStakedMaturityE8s = (neuron: AgnosticNeuron): bigint => {
  if (isNnsNeuron(neuron)) {
    return neuron.fullNeuron?.stakedMaturityE8sEquivalent ?? 0n;
  } else {
    return neuron.staked_maturity_e8s_equivalent[0] ?? 0n;
  }
};

export const getNueronTotalMaturityE8s = (neuron: AgnosticNeuron): bigint => {
  return getNueronFreeMaturityE8s(neuron) + getNueronStakedMaturityE8s(neuron);
};

export const getNueronStakeE8s = (neuron: AgnosticNeuron): bigint => {
  if (isNnsNeuron(neuron)) {
    return neuron.fullNeuron?.cachedNeuronStake ?? 0n;
  } else {
    return neuron.cached_neuron_stake_e8s;
  }
};

export const getNueronFees = (neuron: AgnosticNeuron): bigint => {
  if (isNnsNeuron(neuron)) {
    return neuron.fullNeuron?.neuronFees ?? 0n;
  } else {
    return neuron.neuron_fees_e8s;
  }
};

export const getNueronStakeAfterFeesE8s = (neuron: AgnosticNeuron): bigint => {
  return bigIntMax(getNueronStakeE8s(neuron) - getNueronFees(neuron), 0n);
};

export const getNueronTotalStakeAfterFeesE8s = (
  neuron: AgnosticNeuron
): bigint => {
  return (
    getNueronStakeAfterFeesE8s(neuron) + getNueronStakedMaturityE8s(neuron)
  );
};

export const getNueronTotalValueAfterFeesE8s = (
  neuron: AgnosticNeuron
): bigint => {
  return (
    getNueronTotalStakeAfterFeesE8s(neuron) + getNueronFreeMaturityE8s(neuron)
  );
};

export const getNueronIsAutoStakingMaturity = (
  neuron: AgnosticNeuron
): boolean => {
  if (isNnsNeuron(neuron)) {
    return hasAutoStakeMaturityOn(neuron);
  } else {
    return hasAutoStakeMaturityOnSns(neuron);
  }
};

export const getNueronIsDissolving = (neuron: AgnosticNeuron): boolean => {
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
  if (getNueronIsDissolving(neuron)) {
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

export const getNueronAgeSeconds = (
  neuron: AgnosticNeuron,
  referenceDate: Date = new Date()
): number => {
  if (getNueronIsDissolving(neuron)) {
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
  referanceDate?: Date
): boolean =>
  getNueronStakeE8s(neuron) >= minimumStakeE8s &&
  getNeuronDissolveDelaySeconds(neuron, referanceDate) >=
    minDissolveDelaySeconds;

export const maximiseNeuronParams = (
  neuron: AgnosticNeuron,
  maxDissolveSeconds: number
) => {
  const maxDissolve = BigInt(maxDissolveSeconds);

  if (isNnsNeuron(neuron)) {
    if (neuron.fullNeuron) {
      if (getNueronIsDissolving(neuron)) {
        neuron.fullNeuron.agingSinceTimestampSeconds = BigInt(nowInSeconds());
      }
      neuron.fullNeuron.dissolveState = {
        DissolveDelaySeconds: maxDissolve,
      };
      neuron.fullNeuron.stakedMaturityE8sEquivalent =
        getNueronTotalMaturityE8s(neuron);
      neuron.fullNeuron.maturityE8sEquivalent = 0n;
      neuron.fullNeuron.autoStakeMaturity = true;
    }
    neuron.state = NeuronState.Locked;
    neuron.dissolveDelaySeconds = maxDissolve;
  } else {
    if (getNueronIsDissolving(neuron)) {
      neuron.aging_since_timestamp_seconds = BigInt(nowInSeconds());
    }
    neuron.dissolve_state = [
      {
        DissolveDelaySeconds: maxDissolve,
      },
    ];
    neuron.staked_maturity_e8s_equivalent = [getNueronTotalMaturityE8s(neuron)];
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
  const ageSeconds = getNueronAgeSeconds(neuron, referenceDate);
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
  if (getNueronIsAutoStakingMaturity(neuron)) {
    const newTotal = getNueronStakedMaturityE8s(neuron) + maturityE8s;
    if (isNnsNeuron(neuron)) {
      neuron.fullNeuron!.stakedMaturityE8sEquivalent = newTotal;
    } else {
      neuron.staked_maturity_e8s_equivalent = [newTotal];
    }
  } else {
    const newTotal = getNueronFreeMaturityE8s(neuron) + maturityE8s;
    if (isNnsNeuron(neuron)) {
      neuron.fullNeuron!.maturityE8sEquivalent = newTotal;
    } else {
      neuron.maturity_e8s_equivalent = newTotal;
    }
  }
};
