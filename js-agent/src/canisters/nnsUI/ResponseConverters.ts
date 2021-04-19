import * as convert from "../converter";
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
            id: convert.toSubAccountId(subAccount.sub_account),
            accountIdentifier: subAccount.account_identifier,
            name: subAccount.name,
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
                    amount: convert.toDoms(transfer.Burn.amount)
                }
            };
        }
        if ("Mint" in transfer) {
            return {
                Mint: {
                    amount: convert.toDoms(transfer.Mint.amount)
                }
            };
        }
        if ("Send" in transfer) {
            return {
                Send: {
                    to: transfer.Send.to,
                    amount: convert.toDoms(transfer.Send.amount),
                    fee: convert.toDoms(transfer.Send.fee)
                }
            };
        }
        if ("Receive" in transfer) {
            return {
                Receive: {
                    from: transfer.Receive.from,
                    amount: convert.toDoms(transfer.Receive.amount),
                    fee: convert.toDoms(transfer.Receive.fee)
                }
            };
        }
        throw new Error("Unrecognised transfer type - " + JSON.stringify(transfer));
    }
}
