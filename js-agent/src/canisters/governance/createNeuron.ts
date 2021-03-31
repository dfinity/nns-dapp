import LedgerService, { ICPTs } from "../ledger/model";
import GovernanceService, { GovernanceError } from "./model";
import { BinaryBlob, blobFromUint8Array, DerEncodedBlob, Principal, SignIdentity } from "@dfinity/agent";
import GOVERNANCE_CANISTER_ID from "./canisterId";
import * as convert from "../converters";
import { sha224 } from "@dfinity/agent/lib/cjs/utils/sha224";
import crc from "crc";
import randomBytes from "randombytes";

export type CreateNeuronRequest = {
    stake: ICPTs
    dissolveDelayInSecs: bigint,
    fromSubAccountId?: number
}

export type CreateNeuronResponse = { Ok: bigint } | { Err: GovernanceError };

// Ported from https://github.com/dfinity-lab/dfinity/blob/master/rs/nns/integration_tests/src/ledger.rs#L29
export default async function(
    identity: SignIdentity,
    ledgerService: LedgerService, 
    governanceService: GovernanceService, 
    request: CreateNeuronRequest) : Promise<CreateNeuronResponse> {

    console.log("0. Generate a nonce and a sub-account");
    const publicKey = identity.getPublicKey().toDer();
    const nonce = new Uint8Array(randomBytes(8));
    const toSubAccount = await buildSubAccount(nonce, publicKey);

    console.log("1. Send the stake to a sub-account where the principal is the Governance canister");
    const accountIdentifier = buildAccountIdentifier(GOVERNANCE_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: nonce,
        amount: request.stake,
        to: accountIdentifier,
        fromSubAccountId: request.fromSubAccountId
    });

    console.log("2. Notify the Governance canister that a neuron has been staked");
    await ledgerService.notify({
        toCanister: GOVERNANCE_CANISTER_ID,
        blockHeight: blockHeight,
        toSubAccount: toSubAccount,
        fromSubAccountId: request.fromSubAccountId
    });

    console.log("3. Call the Governance canister to claim the neuron");
    const claimResponse = await governanceService.claimNeuron({
        publicKey,
        nonce: convert.arrayBufferToBigInt(nonce.buffer),
        dissolveDelayInSecs: request.dissolveDelayInSecs    
    });

    return {
        ...claimResponse
    };
}

// 32 bytes
export async function buildSubAccount(nonce: Uint8Array, publicKey: DerEncodedBlob) : Promise<ArrayBuffer> {
    const padding = convert.asciiStringToByteArray("neuron-claim");
    const array = new Uint8Array([
        0x0c, 
        ...padding, 
        ...publicKey, 
        ...nonce]);
    return await crypto.subtle.digest("SHA-256", array);
}

// hex string of length 64
// ported from https://github.com/dfinity-lab/dfinity/blob/master/rs/rosetta-api/canister/src/account_identifier.rs
export function buildAccountIdentifier(principal: Principal, subAccount: ArrayBuffer) : string {
    // Hash (sha224) the principal, the subAccount and some padding
    const padding = convert.asciiStringToByteArray("\x0Aaccount-id");
    const array = new Uint8Array([
        ...padding, 
        ...principal.toBlob(), 
        ...new Uint8Array(subAccount)]);
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
