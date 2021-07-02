import LedgerService from "./ledger/model";
import NnsUiService from "./nnsUI/model";
import { AccountIdentifier, E8s, PrincipalString } from "./common/types";
import { pollUntilComplete } from "./multiPartTransactionPollingHandler";

export type TopUpNeuronRequest = {
    stake: E8s
    fromSubAccountId?: number,
    accountIdentifier: AccountIdentifier
}

export default async function(
    ledgerService: LedgerService,
    nnsUiService: NnsUiService,
    request: TopUpNeuronRequest) : Promise<void> {

    const blockHeight = await ledgerService.sendICPTs({
        amount: request.stake,
        to: request.accountIdentifier,
        fromSubAccountId: request.fromSubAccountId
    });

    const outcome = await pollUntilComplete(nnsUiService, blockHeight);

    if (!("Complete" in outcome)) {
        throw new Error("Unable to top up neuron");
    }
}
