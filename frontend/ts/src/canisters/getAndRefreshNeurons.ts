import GovernanceService, { NeuronInfo } from "./governance/model";
import LedgerService, { GetBalancesRequest } from "./ledger/model";
import { NeuronId } from "./common/types";
import { Option } from "./option";

export default async function (
    governanceService: GovernanceService,
    ledgerService: LedgerService) : Promise<Array<NeuronInfo>> {

    const neurons = await governanceService.getNeurons();

    const neuronsToRefresh = await findNeuronsWhichNeedRefresh(neurons, ledgerService);
    if (!neuronsToRefresh.length) {
        return neurons;
    }

    const promises: Promise<Option<NeuronId>>[] = neuronsToRefresh.map(n => governanceService.claimOrRefreshNeuron({
        neuronId: n,
        by: { NeuronIdOrSubaccount: {} }
    }));
    await Promise.all(promises);

    return await governanceService.getNeurons();
}

const findNeuronsWhichNeedRefresh = async (neurons: Array<NeuronInfo>, ledgerService: LedgerService) : Promise<NeuronId[]> => {
    const fullNeurons = neurons
        .filter(n => n.fullNeuron)
        .map(n => n.fullNeuron!);

    if (!fullNeurons.length) {
        return [];
    }

    const request: GetBalancesRequest = {
        accounts: fullNeurons.map(n => n.accountIdentifier)
    };
    const balances = await ledgerService.getBalances(request);

    return fullNeurons
        .filter(n => n.id && balances[n.accountIdentifier] != n.cachedNeuronStake)
        .map(n => n.id!);
}
