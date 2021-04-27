import { Buffer } from "buffer";
import LedgerService, { E8s } from "./model";
import { NeuronId } from "../governance/model";
import { BinaryBlob, blobFromUint8Array, Principal, SignIdentity } from "@dfinity/agent";
import GOVERNANCE_CANISTER_ID from "../governance/canisterId";
import * as convert from "../converter";
import { sha224 } from "@dfinity/agent/lib/cjs/utils/sha224";
import crc from "crc";
import randomBytes from "randombytes";
import { TransactionNotificationResponse } from "./proto/types_pb";
import { uint8ArrayToBigInt } from "../converter";

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

    const accountIdentifier = buildAccountIdentifier(GOVERNANCE_CANISTER_ID, toSubAccount);
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

// hex string of length 64
// ported from https://github.com/dfinity-lab/dfinity/blob/master/rs/rosetta-api/canister/src/account_identifier.rs
export function buildAccountIdentifier(principal: Principal, subAccount: Uint8Array) : string {
    // Hash (sha224) the principal, the subAccount and some padding
    const padding = convert.asciiStringToByteArray("\x0Aaccount-id");
    const array = new Uint8Array([
        ...padding, 
        ...principal.toBlob(), 
        ...subAccount]);
    const hash = sha224(array);
    
    // Prepend the checksum of the hash and convert to a hex string
    const checksum = calculateCrc32(hash);
    const array2 = new Uint8Array([
        ...checksum,
        ...hash
    ]);
    return blobFromUint8Array(array2).toString("hex");
}

// 4 bytes
function calculateCrc32(bytes: BinaryBlob) : Uint8Array {
    const checksumArrayBuf = new ArrayBuffer(4);
    const view = new DataView(checksumArrayBuf);
    view.setUint32(0, crc.crc32(Buffer.from(bytes)), false);
    return Buffer.from(checksumArrayBuf);
}
