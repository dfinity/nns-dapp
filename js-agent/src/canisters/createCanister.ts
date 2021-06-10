import { Principal } from "@dfinity/principal";
import LedgerService from "./ledger/model";
import NnsUiService  from "./nnsUI/model";
import NNS_UI_CANISTER_ID from "./nnsUI/canisterId";
import { CanisterIdString, E8s, PrincipalString } from "./common/types";
import * as convert from "./converter";
import { CREATE_CANISTER_MEMO
} from "./constants";

const ONE_MINUTE_MILLIS = 60 * 1000;

export type CreateCanisterRequest = {
    amount: E8s
    fromSubAccountId?: number,
    name: string
}

export type CreateCanisterResponse = { created: CanisterIdString } |
    { refunded: null } |
    { error: string };

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

    // Once the ICP has been sent, start polling the NNS UI to check on the status of the create canister request. Only
    // at most 1 canister will be created on each heartbeat so it is possible that a queue may temporarily form.
    // Currently we wait for up to a minute. In the future we could provide a better UX by displaying the position of
    // the user's request in the queue.
    const start = Date.now();
    while (Date.now() - start < ONE_MINUTE_MILLIS) {
        // Wait 5 seconds between each attempt
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            const status = await nnsUiService.getMultiPartTransactionStatus(blockHeight);
            console.log(status);

            if ("CanisterCreated" in status) {
                return { created: status.CanisterCreated.toString() };
            } else if ("Refunded" in status) {
                return { refunded: null };
            } else if ("NotFound" in status) {
                throw new Error("Create canister request not found in the NNS UI canister");
            }
        } catch (e) {
            console.log(e);
            // If there is an error while getting the status simply swallow the error and try again
        }
    }

    throw new Error("Failed to successfully create a canister. Request may still be queued");
}
