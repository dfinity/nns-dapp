import { Principal } from "@dfinity/principal";
import { sha256 } from "js-sha256";
import LedgerService from "./ledger/model";
import NnsUiService from "./nnsUI/model";
import GOVERNANCE_CANISTER_ID from "./governance/canisterId";
import randomBytes from "randombytes";
import { E8s, NeuronId, PrincipalString } from "./common/types";
import * as convert from "./converter";

const ONE_MINUTE_MILLIS = 60 * 1000;

export type CreateNeuronRequest = {
    stake: E8s
    fromSubAccountId?: number
}

export default async function(
    principal: PrincipalString,
    ledgerService: LedgerService,
    nnsUiService: NnsUiService,
    request: CreateNeuronRequest) : Promise<NeuronId> {

    const nonceBytes = new Uint8Array(randomBytes(8));
    const nonce = convert.uint8ArrayToBigInt(nonceBytes);
    const toSubAccount = buildSubAccount(nonceBytes, Principal.fromText(principal));

    const accountIdentifier = convert.principalToAccountIdentifier(GOVERNANCE_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: nonce,
        amount: request.stake,
        to: accountIdentifier,
        fromSubAccountId: request.fromSubAccountId
    });

    // Once the ICP has been sent, start polling the NNS UI to check on the status of the stake neuron request. Only at
    // most 1 neuron will be created on each heartbeat so it is possible that a queue may temporarily form. Currently we
    // wait for up to a minute. In the future we could provide a better UX by displaying the position of the user's
    // request in the queue.
    const start = Date.now();
    while (Date.now() - start < ONE_MINUTE_MILLIS) {
        // Wait 5 seconds between each attempt
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            const status = await nnsUiService.getMultiPartTransactionStatus(blockHeight);

            if ("NeuronCreated" in status) {
                return status.NeuronCreated;
            } else if ("NotFound" in status) {
                throw new Error("Stake neuron request not found in the NNS UI canister");
            }
        } catch (e) {
            console.log(e);
            // If there is an error while getting the status simply swallow the error and try again
        }
    }

    throw new Error("Failed to successfully create a neuron. Request may still be queued");
}

// 32 bytes
export function buildSubAccount(nonce: Uint8Array, principal: Principal) : Uint8Array {
    const padding = convert.asciiStringToByteArray("neuron-stake");
    const shaObj = sha256.create();
    shaObj.update([
        0x0c,
        ...padding,
        ...principal.toUint8Array(),
        ...nonce]);
    return new Uint8Array(shaObj.array());
}
