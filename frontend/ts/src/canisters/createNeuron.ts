import { Principal } from "@dfinity/principal";
import { sha256 } from "js-sha256";
import LedgerService from "./ledger/model";
import NnsUiService from "./nnsUI/model";
import GOVERNANCE_CANISTER_ID from "./governance/canisterId";
import randomBytes from "randombytes";
import { E8s, NeuronId, PrincipalString } from "./common/types";
import * as convert from "./converter";
import { pollUntilComplete } from "./multiPartTransactionPollingHandler";

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

    const outcome = await pollUntilComplete(nnsUiService, blockHeight);

    if ("NeuronCreated" in outcome) {
        return outcome.NeuronCreated;
    } else {
        throw new Error("Unable to create neuron");
    }
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
