import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { TableProject } from "$lib/types/staking";
import type { Universe } from "$lib/types/universe";
import { buildNeuronsUrl } from "$lib/utils/navigation.utils";
import { hasValidStake } from "$lib/utils/sns-neuron.utils";
import type { NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";

// Will filter out neurons without stake from snsNeurons, but assumes neurons
// without stake have already been filtered out from definedNnsNeurons
export const getTableProjects = ({
  universes,
  definedNnsNeurons,
  snsNeurons,
}: {
  universes: Universe[];
  definedNnsNeurons: NeuronInfo[];
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
}): TableProject[] => {
  return universes.map((universe) => {
    const neuronCount =
      universe.canisterId === OWN_CANISTER_ID_TEXT
        ? definedNnsNeurons.length
        : snsNeurons[universe.canisterId]?.neurons.filter(hasValidStake)
            .length ?? 0;
    return {
      rowHref: buildNeuronsUrl({ universe: universe.canisterId }),
      domKey: universe.canisterId,
      title: universe.title,
      logo: universe.logo,
      neuronCount,
    };
  });
};
