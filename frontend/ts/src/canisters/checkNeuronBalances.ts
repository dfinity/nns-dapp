import GovernanceService, { Neuron, NeuronInfo } from "./governance/model";
import LedgerService, { GetBalancesRequest } from "./ledger/model";
import { NeuronId } from "./common/types";
import { Option } from "./option";

const E8S_PER_ICP = 100_000_000;

export default async function (
  neurons: Array<NeuronInfo>,
  ledgerService: LedgerService,
  governanceService: GovernanceService
): Promise<boolean> {
  const neuronsToRefresh = await findNeuronsWhichNeedRefresh(
    neurons,
    ledgerService
  );

  if (!neuronsToRefresh.length) {
    return false;
  }

  const promises: Promise<Option<NeuronId>>[] = neuronsToRefresh.map((n) =>
    governanceService.claimOrRefreshNeuron({
      neuronId: n,
      by: { NeuronIdOrSubaccount: {} },
    })
  );
  await Promise.all(promises);
  return true;
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
  // NOTE: We fetch the balance in an uncertified way as it's more efficient,
  // and a malicious actor wouldn't gain anything by spoofing this value in
  // this context.
  const balances = await ledgerService.getBalances(request, false);

  return fullNeurons
    .filter((n) => {
      const balance = balances[n.accountIdentifier];

      if (n.id && balance != n.cachedNeuronStake) {
        // We can only refresh a neuron if its balance is at least 1 ICP
        if (balance < E8S_PER_ICP) {
          console.log(
            "Cannot refresh neuron because its ledger balance is less than 1 ICP. NeuronId: " +
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
