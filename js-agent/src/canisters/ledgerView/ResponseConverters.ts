import * as convert from "../converters";
import {
    CreateSubAccountResponse,
    GetAccountResponse,
    GetTransactionsResponse,
    NamedSubAccount,
    Transaction,
    Transfer
} from "./model";
import {
    CreateSubAccountResponse as RawCreateSubAccountResponse,
    GetAccountResponse as RawGetAccountResponse,
    GetTransactionsResponse as RawGetTransactionsResponse,
    NamedSubAccount as RawNamedSubAccount,
    Transaction as RawTransaction,
    Transfer as RawTransfer
} from "./rawService";

export default class ResponseConverters {
    public toGetAccountResponse = (response: RawGetAccountResponse) : GetAccountResponse => {
        if ("Ok" in response) {
            return {
                Ok: {
                    accountIdentifier: response.Ok.account_identifier,
                    subAccounts: response.Ok.sub_accounts.map(this.toNamedSubAccount)
                }
            }
        }
        return response;
    }

    public toCreateSubAccountResponse = (response: RawCreateSubAccountResponse) : CreateSubAccountResponse => {
        if ("Ok" in response) {
            return {
                Ok: this.toNamedSubAccount(response.Ok)
            }
        }
        return response;
    }

    public toGetTransactionsResponse = (response: RawGetTransactionsResponse) : GetTransactionsResponse => {
        return {
            total: response.total,
            transactions: response.transactions.map(this.toTransaction)
        };
    }

    public toNamedSubAccount = (subAccount: RawNamedSubAccount) : NamedSubAccount => {
        return {
            accountIdentifier: subAccount.account_identifier,
            name: subAccount.name,
            subAccountIndex: this.toSubAccountIndex(subAccount.sub_account)
        }
    }

    private toTransaction = (transaction: RawTransaction) : Transaction => {
        return {
            timestamp: {
                secs: convert.bigNumberToBigInt(transaction.timestamp.secs),
                nanos: transaction.timestamp.nanos
            },
            blockHeight: convert.bigNumberToBigInt(transaction.block_height),
            transfer: this.toTransfer(transaction.transfer)
        }
    }

    private toTransfer = (transfer: RawTransfer) : Transfer => {
        if ("Burn" in transfer) {
            return {
                Burn: {
                    amount: convert.toICPTs(transfer.Burn.amount)
                }
            };
        }
        if ("Mint" in transfer) {
            return {
                Mint: {
                    amount: convert.toICPTs(transfer.Mint.amount)
                }
            };
        }
        if ("Send" in transfer) {
            return {
                Send: {
                    to: transfer.Send.to,
                    amount: convert.toICPTs(transfer.Send.amount),
                    fee: convert.toICPTs(transfer.Send.fee)
                }
            };
        }
        if ("Receive" in transfer) {
            return {
                Receive: {
                    from: transfer.Receive.from,
                    amount: convert.toICPTs(transfer.Receive.amount),
                    fee: convert.toICPTs(transfer.Receive.fee)
                }
            };
        }
        throw new Error("Unrecognised transfer type - " + JSON.stringify(transfer));
    }

    private toSubAccountIndex = (subAccount: Array<number>) : number => {
        const bytes = convert.arrayOfNumberToArrayBuffer(subAccount);
        return convert.arrayBufferToNumber(bytes);
    }
}
