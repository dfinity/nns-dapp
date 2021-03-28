import * as convert from "../converters";
import {
    CreateSubAccountResponse,
    GetTransactionsResponse,
    NamedSubAccount,
    Transaction,
    Transfer
} from "./model";
import {
    CreateSubAccountResponse as RawCreateSubAccountResponse,
    GetTransactionsResponse as RawGetTransactionsResponse,
    NamedSubAccount as RawNamedSubAccount,
    Transaction as RawTransaction,
    Transfer as RawTransfer
} from "./rawService";

export default class ResponseConverters {
    public toCreateSubAccountResponse(response: RawCreateSubAccountResponse) : CreateSubAccountResponse {
        if ("Ok" in response) {
            return {
                Ok: this.toNamedSubAccount(response.Ok)
            }
        }
        return response;
    }

    public toGetTransactionsResponse(response: RawGetTransactionsResponse) : GetTransactionsResponse {
        return {
            total: response.total,
            transactions: response.transactions.map(this.toTransaction)
        };
    }

    public toNamedSubAccount(subAccount: RawNamedSubAccount) : NamedSubAccount {
        return {
            principal: subAccount.principal,
            name: subAccount.name,
            subAccount: subAccount.sub_account
        }
    }

    private toTransaction(transaction: RawTransaction) : Transaction {
        return {
            timestamp: {
                secs: convert.bigNumberToBigInt(transaction.timestamp.secs),
                nanos: transaction.timestamp.nanos
            },
            blockHeight: convert.bigNumberToBigInt(transaction.block_height),
            transfer: this.toTransfer(transaction.transfer)
        }
    }

    private toTransfer(transfer: RawTransfer): Transfer {
        if ("Burn" in transfer) {
            return {
                Burn: {
                    amount: convert.bigNumberToBigInt(transfer.Burn.amount)
                }
            };
        }
        if ("Mint" in transfer) {
            return {
                Mint: {
                    amount: convert.bigNumberToBigInt(transfer.Mint.amount)
                }
            };
        }
        if ("Send" in transfer) {
            return {
                Send: {
                    to: transfer.Send.to,
                    amount: convert.bigNumberToBigInt(transfer.Send.amount),
                    fee: convert.bigNumberToBigInt(transfer.Send.fee)
                }
            };
        }
        if ("Receive" in transfer) {
            return {
                Receive: {
                    from: transfer.Receive.from,
                    amount: convert.bigNumberToBigInt(transfer.Receive.amount),
                    fee: convert.bigNumberToBigInt(transfer.Receive.fee)
                }
            };
        }
        throw new Error("Unrecognised transfer type - " + JSON.stringify(transfer));
    }
}
