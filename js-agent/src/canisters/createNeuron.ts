import { Principal } from "@dfinity/agent";
import LedgerService from "./ledger/model";
import { SignIdentity } from "@dfinity/agent";
import GOVERNANCE_CANISTER_ID from "./governance/canisterId";
import randomBytes from "randombytes";
import { E8s, NeuronId } from "./common/types";
import * as convert from "./converter";
import { NeuronId as NeuronIdProto } from "./ledger/proto/base_types_pb";

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

    const accountIdentifier = convert.principalToAccountIdentifier(GOVERNANCE_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: convert.uint8ArrayToBigInt(nonce),
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

    return BigInt(NeuronIdProto.deserializeBinary(result).getId());
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
