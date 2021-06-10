import { Principal } from "@dfinity/principal";
import LedgerService from "./ledger/model";
import NnsUiService  from "./nnsUI/model";
import NNS_UI_CANISTER_ID from "./nnsUI/canisterId";
import { CanisterIdString, E8s, PrincipalString } from "./common/types";
import * as convert from "./converter";
import { TOP_UP_CANISTER_MEMO } from "./constants";

const ONE_MINUTE_MILLIS = 60 * 1000;

export type TopUpCanisterRequest = {
    amount: E8s
    fromSubAccountId?: number,
    canisterId: CanisterIdString
}

export type TopUpCanisterResponse = { complete: null } |
    { refunded: null } |
    { error: string };

export async function topUpCanisterImpl(
    ledgerService: LedgerService,
    nnsUiService: NnsUiService,
    request: TopUpCanisterRequest) : Promise<TopUpCanisterResponse> {

    const toSubAccount = buildSubAccount(request.canisterId);
    const recipient = convert.principalToAccountIdentifier(NNS_UI_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: TOP_UP_CANISTER_MEMO,
        amount: request.amount,
        to: recipient,
        fromSubAccountId: request.fromSubAccountId
    });

    // Once the ICP has been sent, start polling the NNS UI to check on the status of the top-up canister request. Only
    // at most 1 canister will be topped up on each heartbeat so it is possible that a queue may temporarily form.
    // Currently we wait for up to a minute. In the future we could provide a better UX by displaying the position of
    // the user's request in the queue.
    const start = Date.now();
    while (Date.now() - start < ONE_MINUTE_MILLIS) {
        // Wait 5 seconds between each attempt
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            const status = await nnsUiService.getMultiPartTransactionStatus(blockHeight);
            console.log(status);

            if ("Complete" in status) {
                return { complete: null };
            } else if ("Refunded" in status) {
                return { refunded: null };
            } else if ("NotFound" in status) {
                throw new Error("TopUp canister request not found in the NNS UI canister");
            }
        } catch (e) {
            console.log(e);
            // If there is an error while getting the status simply swallow the error and try again
        }
    }

    throw new Error("Failed to successfully top-up a canister. Request may still be queued");
}

// 32 bytes
export function buildSubAccount(canisterId: CanisterIdString) : Uint8Array {
    const bytes = Principal.fromText(canisterId).toUint8Array();
    const subAccount = new Uint8Array(32);
    subAccount[0] = bytes.length;
    subAccount.set(bytes, 1);
    return subAccount;
}
