import { GetBalancesRequest, NotifyCanisterRequest, SendICPTsRequest } from "./model";
import * as convert from "../converter";
import { SUB_ACCOUNT_BYTE_LENGTH } from "../constants";
import {
    AccountBalanceRequest,
    AccountIdentifier,
    BlockHeight,
    ICPTs,
    Memo, NotifyRequest,
    Payment, PrincipalId,
    SendRequest, Subaccount
} from "./types/types_pb";
import { arrayBufferToNumber } from "../converter";
import type { Principal } from "@dfinity/agent";

export const TRANSACTION_FEE : bigint = BigInt(137);

export default class RequestConverters {
    public fromGetBalancesRequest = (request: GetBalancesRequest) : Array<AccountBalanceRequest> => {
        return request.accounts.map(a => {
            const request = new AccountBalanceRequest();

            const accountIdentifier = this.toAccountIdentifier(a);
            request.setAccount(accountIdentifier);
            return request;
        });
    }

    public fromSendICPTsRequest = (request: SendICPTsRequest) : SendRequest => {
        const result = new SendRequest();

        const accountIdentifier = this.toAccountIdentifier(request.to);
        result.setTo(accountIdentifier);

        const maxFee = this.toICPTs(request.fee === undefined ? TRANSACTION_FEE : request.fee);
        result.setMaxFee(maxFee);

        if (request.memo != null) {
            const memo = new Memo();
            memo.setMemo(arrayBufferToNumber(request.memo).toString(10));
            result.setMemo(memo);
        }

        const payment = new Payment();
        payment.setReceiverGets(this.toICPTs(request.amount));
        result.setPayment(payment);

        if (request.blockHeight != null) {
            const createdAt = new BlockHeight();
            createdAt.setHeight(request.blockHeight.toString());
            result.setCreatedAt();
        }

        if (request.fromSubAccountId != null) {
            result.setFromSubaccount(this.subAccountIdToSubaccount(request.fromSubAccountId));
        }

        return result;
    }

    public fromNotifyCanisterRequest = (request: NotifyCanisterRequest) : NotifyRequest => {
        const result = new NotifyRequest();
        result.setToCanister(this.toPrincipal(request.toCanister));

        const blockHeight = new BlockHeight();
        blockHeight.setHeight(request.blockHeight.toString());
        result.setBlockHeight(blockHeight);

        if (request.toSubAccount != null) {
            const subaccount = new Subaccount();
            subaccount.setSubAccount(new Uint8Array(request.toSubAccount));
            result.setToSubaccount(subaccount);
        }

        if (request.fromSubAccountId != null) {
            const subaccount = this.subAccountIdToSubaccount(request.fromSubAccountId);
            result.setFromSubaccount(subaccount);
        }

        const maxFee = this.toICPTs(request.maxFee === undefined ? TRANSACTION_FEE : request.maxFee);
        result.setMaxFee(maxFee);

        return result;
    }

    private subAccountIdToSubaccount = (index: number) : Subaccount => {
        const bytes = convert.numberToArrayBuffer(index, SUB_ACCOUNT_BYTE_LENGTH);
        const subaccount = new Subaccount();
        subaccount.setSubAccount(new Uint8Array(bytes));
        return subaccount;
    }

    private toAccountIdentifier = (hexString: string) : AccountIdentifier => {
        const accountIdentifier = new AccountIdentifier();
        accountIdentifier.setHash(Uint8Array.from(Buffer.from(hexString, "hex")));
        return accountIdentifier;
    }

    private toICPTs = (amount: bigint) : ICPTs => {
        const result = new ICPTs();
        result.setE8s(amount.toString(10));
        return result;
    }

    private toPrincipal = (principalId: Principal) : PrincipalId => {
        const result = new PrincipalId();
        result.setSerializedId(principalId.toBlob());
        return result;
    }
}
