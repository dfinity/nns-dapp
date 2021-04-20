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
            timestamp: transaction.timestamp.timestamp_nanos,
            blockHeight: transaction.block_height,
            transfer: this.toTransfer(transaction.transfer)
        }
    }

    private toTransfer = (transfer: RawTransfer) : Transfer => {
        if ("Burn" in transfer) {
            return {
                Burn: {
                    amount: transfer.Burn.amount.e8s
                }
            };
        }
        if ("Mint" in transfer) {
            return {
                Mint: {
                    amount: transfer.Mint.amount.e8s
                }
            };
        }
        if ("Send" in transfer) {
            return {
                Send: {
                    to: transfer.Send.to,
                    amount: transfer.Send.amount.e8s,
                    fee: transfer.Send.fee.e8s
                }
            };
        }
        if ("Receive" in transfer) {
            return {
                Receive: {
                    from: transfer.Receive.from,
                    amount: transfer.Receive.amount.e8s,
                    fee: transfer.Receive.fee.e8s
                }
            };
        }
        throw new Error("Unrecognised transfer type - " + JSON.stringify(transfer));
    }
}
