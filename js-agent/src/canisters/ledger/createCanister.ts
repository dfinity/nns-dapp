import { Principal } from "@dfinity/agent";
import { Option } from "../option";
import LedgerService from "./model";
import MINTING_CANISTER_ID from "../cyclesMinting/canisterId";
import { CyclesNotificationResponse, TransactionNotificationResponse } from "./proto/types_pb";
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
    request: CreateCanisterRequest) : Promise<Option<CanisterId>> {

    const response = await sendAndNotify(
        ledgerService, 
        request.stake,
        principal,
        BigInt(0x41455243), // CREA,
        request.fromSubAccountId);

    if (!response.hasCreatedCanisterId()) {
        console.log("Failed to create canister: ");
        console.log(response);
        return null;
    }

    return Principal.fromBlob(
        convert.uint8ArrayToBlob(
            response.getCreatedCanisterId().getSerializedId_asU8()));
}

export type TopupCanisterRequest = {
    stake: E8s
    fromSubAccountId?: number,
    targetCanisterId: CanisterId
}

export async function topupCanisterImpl(
    ledgerService: LedgerService, 
    request: TopupCanisterRequest) : Promise<void> {

    const response = await sendAndNotify(
        ledgerService, 
        request.stake,
        request.targetCanisterId,
        BigInt(0x50555054), // TPUP
        request.fromSubAccountId);

    if (!response.hasToppedUp()) {
        console.log("Failed to topup canister: ");
        console.log(response);
    }
}

async function sendAndNotify(ledgerService: LedgerService, stake: E8s, recipient: Principal, memo: bigint, fromSubAccountId?: number) : Promise<CyclesNotificationResponse> {
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

    return CyclesNotificationResponse.deserializeBinary(result);
}

// 32 bytes
export function buildSubAccount(principal: Principal) : Uint8Array {
    const blob = principal.toBlob();
    const subAccount = new Uint8Array(32);
    subAccount[0] = blob.length;
    subAccount.set(blob, 1);
    return subAccount;
}
