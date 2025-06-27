import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { type IcpSwapUsdPricesStoreData } from "$lib/derived/icp-swap.derived";
import type { FailedActionableSnsesStoreData } from "$lib/stores/actionable-sns-proposals.store";
import type { TableNeuron } from "$lib/types/neurons-table";
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
import {
  FailedTokenAmount,
  UnavailableTokenAmount,
  getUsdValue,
} from "$lib/utils/token.utils";
import { getLedgerCanisterIdFromUniverse } from "$lib/utils/universe.utils";
import type { NeuronInfo } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import {
  ICPToken,
  TokenAmountV2,
  asNonNullish,
  isNullish,
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
  failedActionableSnses,
}: {
  isSignedIn: boolean;
  universe: Universe;
  token: Token;
  nnsNeurons: NeuronInfo[] | undefined;
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
  failedActionableSnses: FailedActionableSnsesStoreData;
}): {
  neuronCount: number | undefined;
  stake: TokenAmountV2 | UnavailableTokenAmount | FailedTokenAmount;
  availableMaturity: bigint | undefined;
  stakedMaturity: bigint | undefined;
  isStakeLoading: boolean;
} => {
  if (!isSignedIn) {
    const stake = new UnavailableTokenAmount(token);
    return {
      neuronCount: undefined,
      stake,
      availableMaturity: undefined,
      stakedMaturity: undefined,
      isStakeLoading: false,
    };
  }

  if (failedActionableSnses.includes(universe.canisterId)) {
    return {
      neuronCount: undefined,
      stake: new FailedTokenAmount(token),
      availableMaturity: undefined,
      stakedMaturity: undefined,
      isStakeLoading: false,
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
    isStakeLoading: isNullish(stake),
  };
};

export const getTableProjects = ({
  universes,
  isSignedIn,
  nnsNeurons,
  snsNeurons,
  icpSwapUsdPrices,
  failedActionableSnses,
}: {
  universes: Universe[];
  isSignedIn: boolean;
  nnsNeurons: NeuronInfo[] | undefined;
  snsNeurons: { [rootCanisterId: string]: { neurons: SnsNeuron[] } };
  icpSwapUsdPrices: IcpSwapUsdPricesStoreData;
  failedActionableSnses: FailedActionableSnsesStoreData;
}): TableProject[] => {
  return universes.map((universe) => {
    const token =
      universe.canisterId === OWN_CANISTER_ID_TEXT
        ? ICPToken
        : // If the universe is an SNS universe then the summary is non-nullish.
          asNonNullish(universe.summary).token;
    const {
      neuronCount,
      stake,
      availableMaturity,
      stakedMaturity,
      isStakeLoading,
    } = getNeuronAggregateInfo({
      isSignedIn,
      universe,
      token,
      nnsNeurons,
      snsNeurons,
      failedActionableSnses,
    });
    const rowHref =
      stake instanceof FailedTokenAmount
        ? undefined
        : buildNeuronsUrl({ universe: universe.canisterId });
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
      isStakeLoading,
    };
  });
};

export const compareIcpFirst = createDescendingComparator(
  (project: TableProject) => project.universeId === OWN_CANISTER_ID_TEXT
);

const comparePositiveNeuronsFirst = createDescendingComparator(
  (project: TableProject) => (project.neuronCount ?? 0) > 0
);

export const compareByNeuronCount = createDescendingComparator(
  (project: TableProject) => project.neuronCount
);

export const compareByProjectTitle = createAscendingComparator(
  (project: TableProject) => project.title.toLowerCase()
);

export const compareByStakeInUsd = createDescendingComparator(
  (project: TableProject) => getUsdStake(project)
);

export const compareByNeuron = mergeComparators([
  compareIcpFirst,
  compareByNeuronCount,
]);

export const compareByProject = mergeComparators([
  compareIcpFirst,
  compareByProjectTitle,
]);

// This is used when clicking the "Stake" header, but in addition to sorting
// by stake, it has a number of tie breakers.
// Note that it tries to sort by USD stake but also sorts tokens with neurons
// above tokens without neurons if there is no exchange rate for that project.
export const compareByStake = mergeComparators([
  compareIcpFirst,
  compareByStakeInUsd,
  comparePositiveNeuronsFirst,
]);

export const sortTableProjects = (projects: TableProject[]): TableProject[] => {
  return [...projects].sort(
    mergeComparators([
      compareIcpFirst,
      comparePositiveNeuronsFirst,
      compareByProjectTitle,
    ])
  );
};

const getUsdStake = (project: TableProject | TableNeuron) => {
  if (!("stakeInUsd" in project) || isNullish(project.stakeInUsd)) {
    return 0;
  }
  return project.stakeInUsd;
};

export const getTotalStakeInUsd = (
  projects: Array<TableProject | TableNeuron>
): number => projects.reduce((acc, project) => acc + getUsdStake(project), 0);
