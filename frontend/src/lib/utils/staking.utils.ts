import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import type { TableProject } from "$lib/types/staking";
import type { Universe } from "$lib/types/universe";
import { buildNeuronsUrl } from "$lib/utils/navigation.utils";
import {
  neuronStake,
  hasValidStake as nnsHasValidStake,
} from "$lib/utils/neuron.utils";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/responsive-table.utils";
import {
  getSnsNeuronStake,
  hasValidStake as snsHasValidStake,
} from "$lib/utils/sns-neuron.utils";
import { UnavailableTokenAmount } from "$lib/utils/token.utils";
import type { NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import {
  ICPToken,
  TokenAmountV2,
  asNonNullish,
  isNullish,
  type Token,
} from "@dfinity/utils";

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
  token: Token;
} => {
  const neurons =
    snsNeurons[universe.canisterId]?.neurons.filter(snsHasValidStake);
  const stake = neurons?.reduce(
    (acc, neuron) => acc + getSnsNeuronStake(neuron),
    0n
  );
  // If the universe is an SNS universe then the summary is non-nullish.
  const token = asNonNullish(universe.summary).token;
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
}): {
  neuronCount: number | undefined;
  stake: TokenAmountV2 | UnavailableTokenAmount;
} => {
  if (!isSignedIn) {
    const token =
      universe.canisterId === OWN_CANISTER_ID_TEXT
        ? ICPToken
        : // If the universe is an SNS universe then the summary is non-nullish.
          asNonNullish(universe.summary).token;
    const stake = new UnavailableTokenAmount(token);
    return {
      neuronCount: undefined,
      stake,
    };
  }
  const { neuronCount, stake, token } =
    universe.canisterId === OWN_CANISTER_ID_TEXT
      ? getNnsNeuronCountAndStake(nnsNeurons)
      : getSnsNeuronCountAndStake({ snsNeurons, universe });
  return {
    neuronCount,
    stake: isNullish(stake)
      ? new UnavailableTokenAmount(token)
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
    const rowHref = buildNeuronsUrl({ universe: universe.canisterId });
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

// Relies on the domKey being the universeId of the project.
const compareIcpFirst = createDescendingComparator(
  (project: TableProject) => project.domKey === OWN_CANISTER_ID_TEXT
);

const comparePositiveNeuronsFirst = createDescendingComparator(
  (project: TableProject) => (project.neuronCount ?? 0) > 0
);

const compareByProjectTitle = createAscendingComparator(
  (project: TableProject) => project.title.toLowerCase()
);

export const sortTableProjects = (projects: TableProject[]): TableProject[] => {
  return [...projects].sort(
    mergeComparators([
      compareIcpFirst,
      comparePositiveNeuronsFirst,
      compareByProjectTitle,
    ])
  );
};
