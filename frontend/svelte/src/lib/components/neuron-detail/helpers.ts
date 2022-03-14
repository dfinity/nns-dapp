// TODO move to proper folder after merging https://github.com/dfinity/nns-dapp/pull/571
import type { NeuronId, NeuronInfo } from "@dfinity/nns";
import { getNeuron } from "../../services/neurons.services";
import { toastsStore } from "../../stores/toasts.store";

// TODO: reuse getProposalId
export const getNeuronId = (path: string): NeuronId | undefined => {
  const pathDetail = path.split("/").pop();
  if (pathDetail === undefined) {
    return;
  }
  try {
    const id = BigInt(pathDetail);
    return `${id}` === pathDetail ? id : undefined;
  } catch (err) {
    console.error(`Couldn't parse ${pathDetail} as neuron id`);
    return undefined;
  }
};

/**
 * Get from store or query a neuron and apply the result to the callback (`setNeuron`).
 * The function propagate error to the toast and call an optional callback in case of error.
 */
// pass identity and use it just like in loadProposal
export const loadNeuron = async ({
  neuronId,
  setProposal: setNeuron,
  handleError,
}: {
  neuronId: NeuronId;
  setProposal: (proposal: NeuronInfo) => void;
  handleError?: () => void;
}): Promise<void> => {
  const catchError = (error: unknown) => {
    console.error(error);

    toastsStore.show({
      labelKey: "error.neuron_not_found",
      level: "error",
      detail: `id: "${neuronId}"`,
    });

    handleError?.();
  };

  try {
    const neuron: NeuronInfo | undefined = await getNeuron(neuronId);

    if (!neuron) {
      catchError(new Error("Neuron not found"));
      return;
    }

    setNeuron(neuron);
  } catch (error: unknown) {
    catchError(error);
  }
};
