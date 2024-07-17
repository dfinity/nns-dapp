import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { TableProject } from "$lib/types/staking";
import type { Universe } from "$lib/types/universe";
import { buildNeuronsUrl } from "$lib/utils/navigation.utils";
import {
  neuronStake,
  hasValidStake as nnsHasValidStake,
} from "$lib/utils/neuron.utils";
import {
  getSnsNeuronStake,
  hasValidStake as snsHasValidStake,
} from "$lib/utils/sns-neuron.utils";
import type { NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { ICPToken, TokenAmountV2, isNullish, type Token } from "@dfinity/utils";

const getNnsNeuronCountAndStake = (
  nnsNeurons: NeuronInfo[] | undefined
): {
  neuronCount: number | undefined;
  stake: bigint | undefined;
  token: Token;
} => {
  const neurons = nnsNeurons?.filter(nnsHasValidStake);
  const stake = neurons?.reduce((acc, neuron) => acc + neuronStake(neuron), 0n);
  return {
    neuronCount: neurons?.length,
    stake,
    token: ICPToken,
  };
};

const getSnsNeuronCountAndStake = ({
  universe,
  snsNeurons,
}: {
  universe: Universe;
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
}): {
  neuronCount: number | undefined;
  stake: bigint | undefined;
  token: Token | undefined;
} => {
  const neurons =
    snsNeurons[universe.canisterId]?.neurons.filter(snsHasValidStake);
  const stake = neurons?.reduce(
    (acc, neuron) => acc + getSnsNeuronStake(neuron),
    0n
  );
  const token = universe.summary?.token;
  return {
    neuronCount: neurons?.length,
    stake,
    token,
  };
};

const getNeuronCountAndStake = ({
  isSignedIn,
  universe,
  nnsNeurons,
  snsNeurons,
}: {
  isSignedIn: boolean;
  universe: Universe;
  nnsNeurons: NeuronInfo[] | undefined;
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
}): { neuronCount: number | undefined; stake: TokenAmountV2 | undefined } => {
  if (!isSignedIn) {
    return { neuronCount: undefined, stake: undefined };
  }
  const { neuronCount, stake, token } =
    universe.canisterId === OWN_CANISTER_ID_TEXT
      ? getNnsNeuronCountAndStake(nnsNeurons)
      : getSnsNeuronCountAndStake({ snsNeurons, universe });
  return {
    neuronCount,
    stake:
      isNullish(stake) || isNullish(token)
        ? undefined
        : TokenAmountV2.fromUlps({
            amount: stake,
            token,
          }),
  };
};

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
    const { neuronCount, stake } = getNeuronCountAndStake({
      isSignedIn,
      universe,
      nnsNeurons,
      snsNeurons,
    });
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
      stake,
    };
  });
};
