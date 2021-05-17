import { Principal } from "@dfinity/agent";
import LedgerService from "./ledger/model";
import NnsUiService, { AttachCanisterResult } from "./nnsUI/model";
import MINTING_CANISTER_ID from "./cyclesMinting/canisterId";
import { CyclesNotificationResponse } from "./ledger/proto/types_pb";
import { CanisterIdString, E8s, PrincipalString } from "./common/types";
import * as convert from "./converter";
import { CREATE_CANISTER_MEMO, TOP_UP_CANISTER_MEMO } from "./constants";

export type CreateCanisterRequest = {
    stake: E8s
    fromSubAccountId?: number,
    name: string
}

export interface CreateCanisterResponse {
    result: CreateCanisterResult,
    canisterId?: CanisterIdString
    errorMessage?: string
}

export enum CreateCanisterResult {
    Ok,
    FailedToCreateCanister,
    FailedToAttachCanister,
    CanisterAlreadyAttached,
    NameAlreadyTaken,
    CanisterLimitExceeded
}   

export async function createCanisterImpl(
    principal: PrincipalString,
    ledgerService: LedgerService,
    nnsUiService: NnsUiService,
    request: CreateCanisterRequest) : Promise<CreateCanisterResponse> {

    const response = await sendAndNotify(
        ledgerService, 
        request.stake,
        principal,
        CREATE_CANISTER_MEMO,
        request.fromSubAccountId);

    let errorMessage;
    if (response.hasCreatedCanisterId()) {
        const canisterId = Principal.fromBlob(
            convert.uint8ArrayToBlob(
                response.getCreatedCanisterId().getSerializedId_asU8()));

        try {
            const attachResult = await nnsUiService.attachCanister({
                name: request.name,
                canisterId: canisterId.toString()
            });

            switch (attachResult) {
                case AttachCanisterResult.Ok: return { result: CreateCanisterResult.Ok, canisterId: canisterId.toString() };
                case AttachCanisterResult.CanisterAlreadyAttached: return { result: CreateCanisterResult.CanisterAlreadyAttached, canisterId: canisterId.toString() };
                case AttachCanisterResult.NameAlreadyTaken: return { result: CreateCanisterResult.NameAlreadyTaken, canisterId: canisterId.toString() };
                case AttachCanisterResult.CanisterLimitExceeded: return { result: CreateCanisterResult.CanisterLimitExceeded, canisterId: canisterId.toString() };
            }
        } catch (e) {
            return {
                result: CreateCanisterResult.FailedToAttachCanister,
                errorMessage: e.toString()
            };
        }
    } else {
        errorMessage = response.toString();
    }

    return {
        result: CreateCanisterResult.FailedToCreateCanister,
        errorMessage
    };
}

export type TopupCanisterRequest = {
    stake: E8s
    fromSubAccountId?: number,
    targetCanisterId: CanisterIdString
}

export async function topupCanisterImpl(
    ledgerService: LedgerService, 
    request: TopupCanisterRequest) : Promise<boolean> {

    const response = await sendAndNotify(
        ledgerService, 
        request.stake,
        request.targetCanisterId,
        TOP_UP_CANISTER_MEMO,
        request.fromSubAccountId);

    return response.hasToppedUp();
}

async function sendAndNotify(ledgerService: LedgerService, stake: E8s, recipient: PrincipalString, memo: bigint, fromSubAccountId?: number) : Promise<CyclesNotificationResponse> {
    const toSubAccount = buildSubAccount(recipient);
    const accountIdentifier = convert.principalToAccountIdentifier(MINTING_CANISTER_ID, toSubAccount);
    const blockHeight = await ledgerService.sendICPTs({
        memo: memo,
        amount: stake,
        to: accountIdentifier,
        fromSubAccountId: fromSubAccountId
    });

    const result = await ledgerService.notify({
        toCanister: MINTING_CANISTER_ID.toString(),
        blockHeight,
        toSubAccount,
        fromSubAccountId: fromSubAccountId
    });

    return CyclesNotificationResponse.deserializeBinary(result);
}

// 32 bytes
export function buildSubAccount(principal: PrincipalString) : Uint8Array {
    const blob = Principal.fromText(principal).toBlob();
    const subAccount = new Uint8Array(32);
    subAccount[0] = blob.length;
    subAccount.set(blob, 1);
    return subAccount;
}
