import { fromBigNumber } from "../converters";
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
                secs: fromBigNumber(transaction.timestamp.secs),
                nanos: transaction.timestamp.nanos
            },
            blockHeight: fromBigNumber(transaction.block_height),
            transfer: this.convertTransfer(transaction.transfer)
        }
    }

    convertTransfer(transfer: RawTransfer): Transfer {
        if ("Burn" in transfer) {
            return {
                Burn: {
                    amount: fromBigNumber(transfer.Burn.amount)
                }
            };
        }
        if ("Mint" in transfer) {
            return {
                Mint: {
                    amount: fromBigNumber(transfer.Mint.amount)
                }
            };
        }
        if ("Send" in transfer) {
            return {
                Send: {
                    to: transfer.Send.to,
                    amount: fromBigNumber(transfer.Send.amount),
                    fee: fromBigNumber(transfer.Send.fee)
                }
            };
        }
        if ("Receive" in transfer) {
            return {
                Receive: {
                    from: transfer.Receive.from,
                    amount: fromBigNumber(transfer.Receive.amount),
                    fee: fromBigNumber(transfer.Receive.fee)
                }
            };
        }
        throw new Error("Unrecognised transfer type - " + JSON.stringify(transfer));
    }
}

const converter = new ResponseConverter();

export default converter;
