import LedgerService, { ICPTs } from "./model";
import GovernanceService, { GovernanceError } from "../governance/model";
import { Principal } from "@dfinity/agent";
import GOVERNANCE_CANISTER_ID from "../governance/canisterId";
import * as convert from "../converters";

export type CreateNeuronRequest = {
    stake: ICPTs
    owner: Principal,
    dissolveDelayInSecs: bigint
}

export type CreateNeuronResponse = { Ok: bigint } | { Err: GovernanceError };

export default async function(
    ledgerService: LedgerService, 
    governanceService: GovernanceService, 
    request: CreateNeuronRequest) : Promise<CreateNeuronResponse> {

    // 0. Generate a nonce and a sub-account
    let nonce = generateNonce();
    let toSubAccount = await createSubAccount(nonce, request.owner);

    // 1. Send the stake to a sub-account where the principal is the Governance canister
    let blockHeight = await ledgerService.sendICPTs({
        memo: convert.bigintToArrayBuffer(nonce),
        amount: request.stake,
        to: GOVERNANCE_CANISTER_ID,
        toSubAccount: toSubAccount
    });

    // 2. Notify the Governance canister that a neuron has been staked
    await ledgerService.notify({
        toCanister: GOVERNANCE_CANISTER_ID,
        blockHeight: blockHeight,
        toSubAccount: toSubAccount
    });

    // 3. Call the Governance canister to "claim" the neuron
    let claimResponse = await governanceService.claimNeuron({
        owner: request.owner,
        nonce: nonce,
        dissolveDelayInSecs: request.dissolveDelayInSecs    
    });

    return {
        ...claimResponse
    };
}

// 32 bytes
async function createSubAccount(nonce: bigint, owner: Principal) : Promise<ArrayBuffer> {
    const numbers: number[] = [];
    numbers.push(0x0c);
    numbers.concat(convert.asciiStringToByteArray("neuron-claim"));
    numbers.concat(convert.arrayBufferToArrayOfNumber(owner.toBlob()));
    numbers.concat(convert.arrayBufferToArrayOfNumber(convert.bigintToArrayBuffer(nonce)));
    const msgUint8 = convert.arrayOfNumberToArrayBuffer(numbers);
    return await crypto.subtle.digest("SHA-256", msgUint8);
}

// u64
function generateNonce(): bigint {
    var array = new Uint8Array(8);
    window.crypto.getRandomValues(array);
    return convert.arrayBufferToBigInt(array);
}