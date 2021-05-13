import { Principal } from "@dfinity/agent";
import { sha256 } from "js-sha256";
import LedgerService from "./ledger/model";
import GOVERNANCE_CANISTER_ID from "./governance/canisterId";
import randomBytes from "randombytes";
import { BlockHeight, E8s, NeuronId } from "./common/types";
import * as convert from "./converter";
import { NeuronId as NeuronIdProto } from "./ledger/proto/base_types_pb";
import { retryAsync } from "./retry";

export type CreateNeuronRequest = {
    stake: E8s
    fromSubAccountId?: number
}

export type NotificationRequest = {
    blockHeight: BlockHeight,
    nonce: bigint,
    fromSubAccountId?: number
}

// Ported from https://github.com/dfinity-lab/dfinity/blob/master/rs/nns/integration_tests/src/ledger.rs#L29
export default async function(
    principal: Principal,
    ledgerService: LedgerService, 
    request: CreateNeuronRequest) : Promise<NeuronId> {

    const nonceBytes = new Uint8Array(randomBytes(8));
    const nonce = convert.uint8ArrayToBigInt(nonceBytes);
    const toSubAccount = buildSubAccount(nonceBytes, principal);

    const accountIdentifier = convert.principalToAccountIdentifier(GOVERNANCE_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: nonce,
        amount: request.stake,
        to: accountIdentifier,
        fromSubAccountId: request.fromSubAccountId
    });

    const notificationRequest: NotificationRequest = {
        blockHeight,
        nonce,
        fromSubAccountId: request.fromSubAccountId
    };

    return await sendNotification(principal, ledgerService, notificationRequest);
}

export const sendNotification = async (principal: Principal, ledgerService: LedgerService, request: NotificationRequest) : Promise<NeuronId> => {
    const toSubAccount = buildSubAccount(convert.bigIntToUint8Array(request.nonce), principal);

    const result = await retryAsync(() => ledgerService.notify({
        toCanister: GOVERNANCE_CANISTER_ID,
        blockHeight: request.blockHeight,
        toSubAccount,
        fromSubAccountId: request.fromSubAccountId
    }), 5);

    return BigInt(NeuronIdProto.deserializeBinary(result).getId());
}

// 32 bytes
export function buildSubAccount(nonce: Uint8Array, principal: Principal) : Uint8Array {
    const padding = convert.asciiStringToByteArray("neuron-stake");
    const shaObj = sha256.create();
    shaObj.update([
        0x0c,
        ...padding,
        ...principal.toBlob(),
        ...nonce]);
    return new Uint8Array(shaObj.array());
}
