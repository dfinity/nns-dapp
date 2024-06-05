import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { IcpAccountsStoreData } from "$lib/derived/icp-accounts.derived";
import type {
  TableNeuron,
  TableNeuronComparator,
} from "$lib/types/neurons-table";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { buildNeuronUrl } from "$lib/utils/navigation.utils";
import {
  getNeuronTags,
  isSpawning,
  neuronStake,
} from "$lib/utils/neuron.utils";
import {
  getSnsDissolveDelaySeconds,
  getSnsNeuronIdAsHexString,
  getSnsNeuronStake,
  getSnsNeuronState,
  getSnsNeuronTags,
} from "$lib/utils/sns-neuron.utils";
import type { Identity } from "@dfinity/agent";
import type { NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { ICPToken, TokenAmountV2, type Token } from "@dfinity/utils";

export const tableNeuronsFromNeuronInfos = ({
  neuronInfos,
  identity,
  accounts,
  i18n,
}: {
  neuronInfos: NeuronInfo[];
  identity?: Identity | undefined | null;
  accounts: IcpAccountsStoreData;
  i18n: I18n;
}): TableNeuron[] => {
  return neuronInfos.map((neuronInfo) => {
    const { neuronId, dissolveDelaySeconds } = neuronInfo;
    const neuronIdString = neuronId.toString();
    const isSpawningNeuron = isSpawning(neuronInfo);
    const rowHref = isSpawningNeuron
      ? undefined
      : buildNeuronUrl({
          universe: OWN_CANISTER_ID_TEXT,
          neuronId,
        });
    return {
      ...(rowHref && { rowHref }),
      domKey: neuronIdString,
      neuronId: neuronIdString,
      stake: TokenAmountV2.fromUlps({
        amount: neuronStake(neuronInfo),
        token: ICPToken,
      }),
      dissolveDelaySeconds,
      state: neuronInfo.state,
      tags: getNeuronTags({
        neuron: neuronInfo,
        identity,
        accounts,
        i18n,
      }).map(({ text }) => text),
    };
  });
};

export const tableNeuronsFromSnsNeurons = ({
  snsNeurons,
  universe,
  token,
  identity,
  i18n,
}: {
  snsNeurons: SnsNeuron[];
  universe: UniverseCanisterIdText;
  token: Token;
  identity: Identity | undefined | null;
  i18n: I18n;
}): TableNeuron[] => {
  return snsNeurons.map((snsNeuron) => {
    const dissolveDelaySeconds = getSnsDissolveDelaySeconds(snsNeuron) ?? 0n;
    const neuronIdString = getSnsNeuronIdAsHexString(snsNeuron);
    const rowHref = buildNeuronUrl({
      universe,
      neuronId: neuronIdString,
    });
    return {
      rowHref,
      domKey: neuronIdString,
      neuronId: neuronIdString,
      stake: TokenAmountV2.fromUlps({
        amount: getSnsNeuronStake(snsNeuron),
        token,
      }),
      dissolveDelaySeconds,
      state: getSnsNeuronState(snsNeuron),
      tags: getSnsNeuronTags({
        neuron: snsNeuron,
        identity,
        i18n,
      }).map(({ text }) => text),
    };
  });
};

// Takes a list of comparators and returns a single comparator by first applying
// the first comparator and using subsequent comparators to break ties.
const mergeComparators = (
  comparators: TableNeuronComparator[]
): TableNeuronComparator => {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
};

// Creates a comparator for sorting in descending order based on the value
// returned by the getter function.
const createComparator = <T>(
  getter: (neuron: TableNeuron) => T
): TableNeuronComparator => {
  return (a, b) => {
    const valueA = getter(a);
    const valueB = getter(b);
    if (valueA < valueB) return 1;
    if (valueA > valueB) return -1;
    return 0;
  };
};

// Same as createComparator but returns a comparator for sorting in ascending
// order.
const createAscendingComparator = <T>(
  getter: (neuron: TableNeuron) => T
): TableNeuronComparator => {
  const descendingComparator = createComparator(getter);
  return (a, b) => -descendingComparator(a, b);
};

export const compareByStake = createComparator((neuron) =>
  neuron.stake.toUlps()
);

export const compareByDissolveDelay = createComparator(
  (neuron) => neuron.dissolveDelaySeconds
);

// Orders strings as if they are positive integers, so "9" < "10" < "11", by
// ordering first by length and then legicographically.
export const compareById = mergeComparators([
  createAscendingComparator((neuron) => neuron.neuronId.length),
  createAscendingComparator((neuron) => neuron.neuronId),
]);

// Sorts neurons based on a provided custom ordering.
export const sortNeurons = ({
  neurons,
  order,
}: {
  neurons: TableNeuron[];
  order: TableNeuronComparator[];
}): TableNeuron[] => {
  return [...neurons].sort(mergeComparators(order));
};
