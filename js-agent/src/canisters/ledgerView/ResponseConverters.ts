import * as convert from "../converters";
import { GetTransactionsResponse, Transaction, Transfer } from "./model";
import {
    GetTransactionsResponse as RawGetTransactionsResponse,
    Transaction as RawTransaction,
    Transfer as RawTransfer
} from "./rawService";

export default class ResponseConverters {
    convertGetTransactionsResponse(response: RawGetTransactionsResponse) : GetTransactionsResponse {
        return {
            total: response.total,
            transactions: response.transactions.map(this.convertTransaction)
        };
    }

    convertTransaction(transaction: RawTransaction) : Transaction {
        return {
            timestamp: {
                secs: convert.bigNumberToBigInt(transaction.timestamp.secs),
                nanos: transaction.timestamp.nanos
            },
            blockHeight: convert.bigNumberToBigInt(transaction.block_height),
            transfer: this.convertTransfer(transaction.transfer)
        }
    }

    convertTransfer(transfer: RawTransfer): Transfer {
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
