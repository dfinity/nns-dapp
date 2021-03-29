import LedgerService, { ICPTs } from "./model";
import GovernanceService, { GovernanceError } from "../governance/model";
import { DerEncodedBlob } from "@dfinity/agent";
import GOVERNANCE_CANISTER_ID from "../governance/canisterId";
import * as convert from "../converters";

export type CreateNeuronRequest = {
    stake: ICPTs
    dissolveDelayInSecs: bigint
}

export type CreateNeuronResponse = { Ok: bigint } | { Err: GovernanceError };

export default async function(
    publicKey: DerEncodedBlob,
    ledgerService: LedgerService, 
    governanceService: GovernanceService, 
    request: CreateNeuronRequest) : Promise<CreateNeuronResponse> {

    // 0. Generate a nonce and a sub-account
    let nonce = generateNonce();
    let toSubAccount = await createSubAccount(nonce, publicKey);

    // 1. Send the stake to a sub-account where the principal is the Governance canister
    let blockHeight = await ledgerService.sendICPTs({
        memo: nonce,
        amount: request.stake,
        to: GOVERNANCE_CANISTER_ID.toString(),
        // TODO - toSubAccount: toSubAccount
    });

    // 2. Notify the Governance canister that a neuron has been staked
    await ledgerService.notify({
        toCanister: GOVERNANCE_CANISTER_ID,
        blockHeight: blockHeight,
        toSubAccount: toSubAccount
    });

    // 3. Call the Governance canister to "claim" the neuron
    let claimResponse = await governanceService.claimNeuron({
        publicKey,
        nonce: convert.arrayBufferToBigInt(nonce),
        dissolveDelayInSecs: request.dissolveDelayInSecs    
    });

    return {
        ...claimResponse
    };
}

// 32 bytes
export async function createSubAccount(nonce: Uint8Array, publicKey: DerEncodedBlob) : Promise<ArrayBuffer> {
    const text = "neuron-claim";
    const bufferSize = 1 + text.length + publicKey.length + nonce.length;
    let buffer = new ArrayBuffer(bufferSize);
    let bytes = new Uint8Array(buffer);
    bytes[0] = 0x0c;
    bytes.set(convert.asciiStringToByteArray("neuron-claim"), 1);
    bytes.set(publicKey, 1 + text.length);
    bytes.set(nonce, 1 + text.length + publicKey.length);
    return await crypto.subtle.digest("SHA-256", bytes);
}

// 8 bytes
function generateNonce(): Uint8Array {
    var array = new Uint8Array(8);
    window.crypto.getRandomValues(array);
    return array;
}