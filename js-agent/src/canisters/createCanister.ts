import LedgerService from "./ledger/model";
import NnsUiService  from "./nnsUI/model";
import NNS_UI_CANISTER_ID from "./nnsUI/canisterId";
import { CanisterIdString, E8s, PrincipalString } from "./common/types";
import * as convert from "./converter";
import { CREATE_CANISTER_MEMO
} from "./constants";
import { pollUntilComplete } from "./multiPartTransactionPollingHandler";


export type CreateCanisterRequest = {
    amount: E8s
    fromSubAccountId?: number,
    name: string
}

export type CreateCanisterResponse =
    { created: CanisterIdString } |
    { error: { message: string, refunded: boolean } };

export async function createCanisterImpl(
    principal: PrincipalString,
    ledgerService: LedgerService,
    nnsUiService: NnsUiService,
    request: CreateCanisterRequest) : Promise<CreateCanisterResponse> {

    const toSubAccount = convert.principalToSubAccount(principal);
    const recipient = convert.principalToAccountIdentifier(NNS_UI_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: CREATE_CANISTER_MEMO,
        amount: request.amount,
        to: recipient,
        fromSubAccountId: request.fromSubAccountId
    });

    const outcome = await pollUntilComplete(nnsUiService, blockHeight);

    if ("CanisterCreated" in outcome) {
        return { created: outcome.CanisterCreated.toString() }
    } else if ("Refunded" in outcome) {
        return { error: { message: outcome[1], refunded: true } };
    } else if ("Error" in outcome) {
        return { error: { message: outcome.Error, refunded: false } };
    } else {
        throw new Error("Unable to create canister");
    }
}
