import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { type IcpSwapUsdPricesStoreData } from "$lib/derived/icp-swap.derived";
import type { TableProject } from "$lib/types/staking";
import type { Universe } from "$lib/types/universe";
import { buildNeuronsUrl } from "$lib/utils/navigation.utils";
import {
  neuronAvailableMaturity,
  neuronStake,
  neuronStakedMaturity,
  hasValidStake as nnsHasValidStake,
} from "$lib/utils/neuron.utils";
import {
  getSnsNeuronAvailableMaturity,
  getSnsNeuronStake,
  getSnsNeuronStakedMaturity,
  hasValidStake as snsHasValidStake,
} from "$lib/utils/sns-neuron.utils";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/sort.utils";
import { UnavailableTokenAmount, getUsdValue } from "$lib/utils/token.utils";
import { getLedgerCanisterIdFromUniverse } from "$lib/utils/universe.utils";
import type { NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import {
  ICPToken,
  TokenAmountV2,
  asNonNullish,
  isNullish,
  nonNullish,
  type Token,
} from "@dfinity/utils";

const getNnsNeuronAggregateInfo = (
  nnsNeurons: NeuronInfo[] | undefined
): {
  neuronCount: number | undefined;
  stake: bigint | undefined;
  availableMaturity: bigint | undefined;
  stakedMaturity: bigint | undefined;
} => {
  const neurons = nnsNeurons?.filter(nnsHasValidStake);
  const stake = neurons?.reduce((acc, neuron) => acc + neuronStake(neuron), 0n);
  const availableMaturity = neurons?.reduce(
    (acc, neuron) => acc + neuronAvailableMaturity(neuron),
    0n
  );
  const stakedMaturity = neurons?.reduce(
    (acc, neuron) => acc + neuronStakedMaturity(neuron),
    0n
  );
  return {
    neuronCount: neurons?.length,
    stake,
    availableMaturity,
    stakedMaturity,
  };
};

const getSnsNeuronAggregateInfo = ({
  universe,
  snsNeurons,
}: {
  universe: Universe;
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
}): {
  neuronCount: number | undefined;
  stake: bigint | undefined;
  availableMaturity: bigint | undefined;
  stakedMaturity: bigint | undefined;
} => {
  const neurons =
    snsNeurons[universe.canisterId]?.neurons.filter(snsHasValidStake);
  const stake = neurons?.reduce(
    (acc, neuron) => acc + getSnsNeuronStake(neuron),
    0n
  );
  const availableMaturity = neurons?.reduce(
    (acc, neuron) => acc + getSnsNeuronAvailableMaturity(neuron),
    0n
  );
  const stakedMaturity = neurons?.reduce(
    (acc, neuron) => acc + getSnsNeuronStakedMaturity(neuron),
    0n
  );
  return {
    neuronCount: neurons?.length,
    stake,
    availableMaturity,
    stakedMaturity,
  };
};

const getNeuronAggregateInfo = ({
  isSignedIn,
  universe,
  token,
  nnsNeurons,
  snsNeurons,
}: {
  isSignedIn: boolean;
  universe: Universe;
  token: Token;
  nnsNeurons: NeuronInfo[] | undefined;
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
}): {
  neuronCount: number | undefined;
  stake: TokenAmountV2 | UnavailableTokenAmount;
  availableMaturity: bigint | undefined;
  stakedMaturity: bigint | undefined;
} => {
  if (!isSignedIn) {
    const stake = new UnavailableTokenAmount(token);
    return {
      neuronCount: undefined,
      stake,
      availableMaturity: undefined,
      stakedMaturity: undefined,
    };
  }
  const { neuronCount, stake, availableMaturity, stakedMaturity } =
    universe.canisterId === OWN_CANISTER_ID_TEXT
      ? getNnsNeuronAggregateInfo(nnsNeurons)
      : getSnsNeuronAggregateInfo({ snsNeurons, universe });
  return {
    neuronCount,
    stake: isNullish(stake)
      ? new UnavailableTokenAmount(token)
      : TokenAmountV2.fromUlps({
          amount: stake,
          token,
        }),
    availableMaturity,
    stakedMaturity,
  };
};

export const getTableProjects = ({
  universes,
  isSignedIn,
  nnsNeurons,
  snsNeurons,
  icpSwapUsdPrices,
}: {
  universes: Universe[];
  isSignedIn: boolean;
  nnsNeurons: NeuronInfo[] | undefined;
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
  icpSwapUsdPrices?: IcpSwapUsdPricesStoreData;
}): TableProject[] => {
  return universes.map((universe) => {
    const token =
      universe.canisterId === OWN_CANISTER_ID_TEXT
        ? ICPToken
        : // If the universe is an SNS universe then the summary is non-nullish.
          asNonNullish(universe.summary).token;
    const { neuronCount, stake, availableMaturity, stakedMaturity } =
      getNeuronAggregateInfo({
        isSignedIn,
        universe,
        token,
        nnsNeurons,
        snsNeurons,
      });
    const rowHref =
      nonNullish(neuronCount) && neuronCount > 0
        ? buildNeuronsUrl({ universe: universe.canisterId })
        : undefined;
    const universeId = universe.canisterId;
    const ledgerCanisterId = getLedgerCanisterIdFromUniverse(universe);
    const tokenPrice =
      isNullish(icpSwapUsdPrices) || icpSwapUsdPrices === "error"
        ? undefined
        : icpSwapUsdPrices[ledgerCanisterId.toText()];
    const stakeInUsd =
      stake instanceof TokenAmountV2
        ? getUsdValue({
            amount: stake,
            tokenPrice,
          })
        : undefined;
    return {
      rowHref,
      domKey: universeId,
      universeId,
      title: universe.title,
      logo: universe.logo,
      tokenSymbol: token.symbol,
      neuronCount,
      stake,
      stakeInUsd,
      availableMaturity,
      stakedMaturity,
    };
  });
};

const compareIcpFirst = createDescendingComparator(
  (project: TableProject) => project.universeId === OWN_CANISTER_ID_TEXT
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
