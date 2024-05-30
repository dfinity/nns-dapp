import type {
  TableNeuron,
  TableNeuronComparator,
} from "$lib/types/neurons-table";

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
