import LedgerService from "./model";
import { NeuronId } from "../governance/model";
import { Principal, SignIdentity } from "@dfinity/agent";
import GOVERNANCE_CANISTER_ID from "../governance/canisterId";
import * as convert from "../converter";
import randomBytes from "randombytes";
import { TransactionNotificationResponse } from "./proto/types_pb";
import { principalToAccountIdentifier, uint8ArrayToBigInt } from "../converter";
import { E8s } from "../common/types";

export type CreateNeuronRequest = {
    stake: E8s
    fromSubAccountId?: number
}

// Ported from https://github.com/dfinity-lab/dfinity/blob/master/rs/nns/integration_tests/src/ledger.rs#L29
export default async function(
    identity: SignIdentity,
    ledgerService: LedgerService, 
    request: CreateNeuronRequest) : Promise<NeuronId> {

    const principal = identity.getPrincipal();
    const nonce = new Uint8Array(randomBytes(8));
    const toSubAccount = await buildSubAccount(nonce, principal);

    const accountIdentifier = principalToAccountIdentifier(GOVERNANCE_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: nonce,
        amount: request.stake,
        to: accountIdentifier,
        fromSubAccountId: request.fromSubAccountId
    });

    const result = await ledgerService.notify({
        toCanister: GOVERNANCE_CANISTER_ID,
        blockHeight,
        toSubAccount,
        fromSubAccountId: request.fromSubAccountId
    });
    console.log("notify result");
    console.log(result);

    // console.log("deserializeBinary");
    // console.log(NeuronIdProto.deserializeBinary(result));

    const neuronId = uint8ArrayToBigInt(TransactionNotificationResponse.deserializeBinary(result).getResponse_asU8());
    console.log("neuronId");
    console.log(neuronId);

    return neuronId;
}

// 32 bytes
export async function buildSubAccount(nonce: Uint8Array, principal: Principal) : Promise<Uint8Array> {
    const padding = convert.asciiStringToByteArray("neuron-stake");
    const array = new Uint8Array([
        0x0c, 
        ...padding, 
        ...principal.toBlob(),
        ...nonce]);
    const result = await crypto.subtle.digest("SHA-256", array);
    return new Uint8Array(result);
}
