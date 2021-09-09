import GovernanceService, { Neuron, NeuronInfo } from "./governance/model";
import LedgerService, { GetBalancesRequest } from "./ledger/model";
import { NeuronId } from "./common/types";
import { Option } from "./option";
import { TRANSACTION_FEE } from "./constants";

const E8S_PER_ICP = 100_000_000;

export default async function (
  governanceService: GovernanceService,
  ledgerService: LedgerService
): Promise<Array<NeuronInfo>> {
  let neurons = await governanceService.getNeurons();

  const neuronsToRefresh = await findNeuronsWhichNeedRefresh(
    neurons,
    ledgerService
  );

  if (neuronsToRefresh.length) {
    const promises: Promise<Option<NeuronId>>[] = neuronsToRefresh.map((n) =>
      governanceService.claimOrRefreshNeuron({
        neuronId: n,
        by: { NeuronIdOrSubaccount: {} },
      })
    );
    await Promise.all(promises);

    neurons = await governanceService.getNeurons();
  }

  // We hide neurons whose balance is <= 1 transaction fee since since they are worthless and many of them can build up.
  // These will eventually get garbage collected within the governance canister but that isn't implemented yet.
  return neurons.filter(
    (n) => n.fullNeuron && n.fullNeuron.cachedNeuronStake > TRANSACTION_FEE
  );
}

const findNeuronsWhichNeedRefresh = async (
  neurons: Array<NeuronInfo>,
  ledgerService: LedgerService
): Promise<NeuronId[]> => {
  const fullNeurons = neurons
    .filter((n) => n.fullNeuron)
    .map((n) => n.fullNeuron as Neuron);

  if (!fullNeurons.length) {
    return [];
  }

  const request: GetBalancesRequest = {
    accounts: fullNeurons.map((n) => n.accountIdentifier),
  };
  const balances = await ledgerService.getBalances(request);

  return fullNeurons
    .filter((n) => {
      const balance = balances[n.accountIdentifier];

      if (n.id && balance != n.cachedNeuronStake) {
        // We can only refresh a neuron if its balance is at least 1 ICP
        if (balance < E8S_PER_ICP) {
          console.log(
            "Neuron ledger balance is less than 1 ICP. NeuronId: " +
              n.id +
              ". AccountIdentifier: " +
              n.accountIdentifier
          );
          return false;
        }
        return true;
      }
      return false;
    })
    .map((n) => n.id as NeuronId);
};
