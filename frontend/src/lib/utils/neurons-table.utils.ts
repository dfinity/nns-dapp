import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import type { IcpAccountsStoreData } from "$lib/derived/icp-accounts.derived";
import { type IcpSwapUsdPricesStoreData } from "$lib/derived/icp-swap.derived";
import type {
  NeuronsTableColumnId,
  TableNeuron,
  TableNeuronComparator,
} from "$lib/types/neurons-table";
import type { UniverseCanisterIdText } from "$lib/types/universe";
import { buildNeuronUrl } from "$lib/utils/navigation.utils";
import {
  getNeuronTags,
  isPublicNeuron,
  isSpawning,
  neuronAvailableMaturity,
  neuronStake,
  neuronStakedMaturity,
} from "$lib/utils/neuron.utils";
import {
  getSnsDissolveDelaySeconds,
  getSnsNeuronAvailableMaturity,
  getSnsNeuronIdAsHexString,
  getSnsNeuronStake,
  getSnsNeuronStakedMaturity,
  getSnsNeuronState,
  getSnsNeuronTags,
} from "$lib/utils/sns-neuron.utils";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/sort.utils";
import { getUsdValue } from "$lib/utils/token.utils";
import type { Identity } from "@dfinity/agent";
import type { NeuronInfo } from "@dfinity/nns";
import { NeuronState } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuron } from "@dfinity/sns";
import { ICPToken, TokenAmountV2, isNullish, type Token } from "@dfinity/utils";

export const tableNeuronsFromNeuronInfos = ({
  neuronInfos,
  identity,
  accounts,
  icpSwapUsdPrices,
  i18n,
  startReducingVotingPowerAfterSeconds,
}: {
  neuronInfos: NeuronInfo[];
  identity?: Identity | undefined | null;
  accounts: IcpAccountsStoreData;
  icpSwapUsdPrices: IcpSwapUsdPricesStoreData;
  i18n: I18n;
  startReducingVotingPowerAfterSeconds: bigint | undefined;
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
    const stake = TokenAmountV2.fromUlps({
      amount: neuronStake(neuronInfo),
      token: ICPToken,
    });
    const icpPrice =
      isNullish(icpSwapUsdPrices) || icpSwapUsdPrices === "error"
        ? undefined
        : icpSwapUsdPrices[LEDGER_CANISTER_ID.toText()];
    const stakeInUsd = getUsdValue({
      amount: stake,
      tokenPrice: icpPrice,
    });
    return {
      ...(rowHref && { rowHref }),
      domKey: neuronIdString,
      neuronId: neuronIdString,
      stake,
      stakeInUsd,
      availableMaturity: neuronAvailableMaturity(neuronInfo),
      stakedMaturity: neuronStakedMaturity(neuronInfo),
      dissolveDelaySeconds,
      state: neuronInfo.state,
      tags: getNeuronTags({
        neuron: neuronInfo,
        identity,
        accounts,
        i18n,
        startReducingVotingPowerAfterSeconds,
      }),
      isPublic: isPublicNeuron(neuronInfo),
    };
  });
};

export const tableNeuronsFromSnsNeurons = ({
  snsNeurons,
  universe,
  token,
  identity,
  icpSwapUsdPrices,
  ledgerCanisterId,
  i18n,
}: {
  snsNeurons: SnsNeuron[];
  universe: UniverseCanisterIdText;
  token: Token;
  identity: Identity | undefined | null;
  icpSwapUsdPrices: IcpSwapUsdPricesStoreData;
  ledgerCanisterId: Principal;
  i18n: I18n;
}): TableNeuron[] => {
  return snsNeurons.map((snsNeuron) => {
    const dissolveDelaySeconds = getSnsDissolveDelaySeconds(snsNeuron) ?? 0n;
    const neuronIdString = getSnsNeuronIdAsHexString(snsNeuron);
    const rowHref = buildNeuronUrl({
      universe,
      neuronId: neuronIdString,
    });
    const stake = TokenAmountV2.fromUlps({
      amount: getSnsNeuronStake(snsNeuron),
      token,
    });
    const tokenPrice =
      isNullish(icpSwapUsdPrices) || icpSwapUsdPrices === "error"
        ? undefined
        : icpSwapUsdPrices[ledgerCanisterId.toText()];
    const stakeInUsd = getUsdValue({
      amount: stake,
      tokenPrice,
    });
    return {
      rowHref,
      domKey: neuronIdString,
      neuronId: neuronIdString,
      stake,
      stakeInUsd,
      availableMaturity: getSnsNeuronAvailableMaturity(snsNeuron),
      stakedMaturity: getSnsNeuronStakedMaturity(snsNeuron),
      dissolveDelaySeconds,
      state: getSnsNeuronState(snsNeuron),
      tags: getSnsNeuronTags({
        neuron: snsNeuron,
        identity,
        i18n,
      }),
      isPublic: false,
    };
  });
};

export const compareByStake = createDescendingComparator(
  (neuron: TableNeuron) => neuron.stake.toUlps()
);

export const compareByMaturity = createDescendingComparator(
  (neuron: TableNeuron) => neuron.availableMaturity + neuron.stakedMaturity
);

export const compareByDissolveDelay = createDescendingComparator(
  (neuron: TableNeuron) => neuron.dissolveDelaySeconds
);

export const compareByState = createDescendingComparator(
  (neuron: TableNeuron) =>
    [
      NeuronState.Spawning,
      NeuronState.Dissolved,
      NeuronState.Dissolving,
      NeuronState.Locked,
    ].indexOf(neuron.state)
);

// Orders strings as if they are positive integers, so "9" < "10" < "11", by
// ordering first by length and then legicographically.
export const compareById = mergeComparators([
  createAscendingComparator((neuron: TableNeuron) => neuron.neuronId.length),
  createAscendingComparator((neuron: TableNeuron) => neuron.neuronId),
]);

// The 'id' comparator is intentionally omitted from this mapping to prevent the Neurons column
// from being sortable in the neurons table. This is a deliberate UX decision to avoid confusion,
// as sorting by neuron ID typically doesn't provide meaningful information to users.
export const comparatorsByColumnId: Partial<
  Record<NeuronsTableColumnId, TableNeuronComparator>
> = {
  stake: compareByStake,
  maturity: compareByMaturity,
  dissolveDelay: compareByDissolveDelay,
  state: compareByState,
};
