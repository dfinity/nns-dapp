import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { TableProject } from "$lib/types/staking";
import type { Universe } from "$lib/types/universe";
import { buildNeuronsUrl } from "$lib/utils/navigation.utils";
import { hasValidStake as nnsHasValidStake } from "$lib/utils/neuron.utils";
import { hasValidStake as snsHasValidStake } from "$lib/utils/sns-neuron.utils";
import type { NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";

export const getTableProjects = ({
  universes,
  isSignedIn,
  nnsNeurons,
  snsNeurons,
}: {
  universes: Universe[];
  isSignedIn: boolean;
  nnsNeurons: NeuronInfo[] | undefined;
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
}): TableProject[] => {
  return universes.map((universe) => {
    const neuronCount = !isSignedIn
      ? undefined
      : universe.canisterId === OWN_CANISTER_ID_TEXT
      ? nnsNeurons?.filter(nnsHasValidStake).length
      : snsNeurons[universe.canisterId]?.neurons.filter(snsHasValidStake)
          .length;
    const rowHref =
      (neuronCount ?? 0) > 0
        ? buildNeuronsUrl({ universe: universe.canisterId })
        : undefined;
    return {
      rowHref,
      domKey: universe.canisterId,
      title: universe.title,
      logo: universe.logo,
      neuronCount,
    };
  });
};
