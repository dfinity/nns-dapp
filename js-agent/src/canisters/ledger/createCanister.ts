import { Principal } from "@dfinity/agent";
import LedgerService from "./model";
import MINTING_CANISTER_ID from "../cyclesMinting/canisterId";
import { TransactionNotificationResponse } from "./proto/types_pb";
import { E8s } from "../common/types";
import * as convert from "../converter";

export type CanisterId = Principal;

export type CreateCanisterRequest = {
    stake: E8s
    fromSubAccountId?: number
}

export async function createCanisterImpl(
    principal: Principal,
    ledgerService: LedgerService, 
    request: CreateCanisterRequest) : Promise<CanisterId> {

    const result = sendAndNotify(
        ledgerService, 
        request.stake,
        principal,
        BigInt(0x41455243), // CREA,
        request.fromSubAccountId);

    // TODO: Extract canister id from response
    console.log("canisterId");
    console.log(result);
    
    return Principal.anonymous();
}

export type TopupCanisterRequest = {
    stake: E8s
    fromSubAccountId?: number,
    targetCanisterId: CanisterId
}

export async function topupCanisterImpl(
    ledgerService: LedgerService, 
    request: TopupCanisterRequest) : Promise<void> {

    const result = sendAndNotify(
        ledgerService, 
        request.stake,
        request.targetCanisterId,
        BigInt(0x50555054), // TPUP
        request.fromSubAccountId);

    console.log("topupCanister result");
    console.log(result);
}

async function sendAndNotify(ledgerService: LedgerService, stake: E8s, recipient: Principal, memo: bigint, fromSubAccountId?: number) : Promise<Uint8Array> {
    const toSubAccount = buildSubAccount(recipient);
    const accountIdentifier = convert.principalToAccountIdentifier(MINTING_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: memo,
        amount: stake,
        to: accountIdentifier,
        fromSubAccountId: fromSubAccountId
    });

    const result = await ledgerService.notify({
        toCanister: MINTING_CANISTER_ID,
        blockHeight,
        toSubAccount,
        fromSubAccountId: fromSubAccountId
    });
    console.log("notify result");
    console.log(result);

    return TransactionNotificationResponse.deserializeBinary(result).getResponse_asU8();
}

// 32 bytes
export function buildSubAccount(principal: Principal) : Uint8Array {
    const blob = principal.toBlob();
    const subAccount = new Uint8Array(32);
    subAccount[0] = blob.length;
    subAccount.set(blob, 1);
    return subAccount;
}
