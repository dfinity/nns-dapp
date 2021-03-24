import { bigNumberToBigInt } from "../converters";
import { GetTransactionsResponse, Transaction, Transfer } from "./model";
import {
    GetTransactionsResponse as RawGetTransactionsResponse,
    Transaction as RawTransaction,
    Transfer as RawTransfer
} from "./rawService";

class ResponseConverter {
    convertGetTransactionsResponse(response: RawGetTransactionsResponse) : GetTransactionsResponse {
        return {
            total: response.total,
            transactions: response.transactions.map(this.convertTransaction)
        };
    }

    convertTransaction(transaction: RawTransaction) : Transaction {
        return {
            timestamp: {
                secs: bigNumberToBigInt(transaction.timestamp.secs),
                nanos: transaction.timestamp.nanos
            },
            blockHeight: bigNumberToBigInt(transaction.block_height),
            transfer: this.convertTransfer(transaction.transfer)
        }
    }

    convertTransfer(transfer: RawTransfer): Transfer {
        if ("Burn" in transfer) {
            return {
                Burn: {
                    amount: bigNumberToBigInt(transfer.Burn.amount)
                }
            };
        }
        if ("Mint" in transfer) {
            return {
                Mint: {
                    amount: bigNumberToBigInt(transfer.Mint.amount)
                }
            };
        }
        if ("Send" in transfer) {
            return {
                Send: {
                    to: transfer.Send.to,
                    amount: bigNumberToBigInt(transfer.Send.amount),
                    fee: bigNumberToBigInt(transfer.Send.fee)
                }
            };
        }
        if ("Receive" in transfer) {
            return {
                Receive: {
                    from: transfer.Receive.from,
                    amount: bigNumberToBigInt(transfer.Receive.amount),
                    fee: bigNumberToBigInt(transfer.Receive.fee)
                }
            };
        }
        throw new Error("Unrecognised transfer type - " + JSON.stringify(transfer));
    }
}

const converter = new ResponseConverter();

export default converter;
