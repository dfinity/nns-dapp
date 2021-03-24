import RawService, {
    GetTransactionsRequest as RawGetTransactionsRequest,
    Transfer as RawTransfer
} from "./rawService";
import { Principal } from "@dfinity/agent";
import { bigNumberToBigInt } from "../converters";

export default class Service {
    private readonly service: RawService;
    public constructor(service: RawService) {
        this.service = service;
    }

    public async getTransactions(request: GetTransactionsRequest) : Promise<GetTransactionsResponse> {
        const rawRequest: RawGetTransactionsRequest = {
            offset: request.offset,
            page_size: request.pageSize
        };

        const rawResponse = await this.service.get_transactions(rawRequest);

        const response: GetTransactionsResponse = {
            total: rawResponse.total,
            transactions: rawResponse.transactions.map(t => ({
                timestamp: {
                    secs: BigInt(t.timestamp.secs),
                    nanos: t.timestamp.nanos
                },
                blockHeight: BigInt(t.block_height),
                transfer: this.convertTransfer(t.transfer)
            }))
        };

        return response;
    }

    convertTransfer(transfer: RawTransfer) : Transfer {
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

interface GetTransactionsRequest {
    offset: number,
    pageSize: number
}

interface GetTransactionsResponse {
    total : number,
    transactions : Array<Transaction>,
}

type BlockHeight = bigint;
type Doms = bigint;

interface Transaction {
    timestamp : Timestamp,
    blockHeight : BlockHeight,
    transfer : Transfer,
}

interface Timestamp {
    secs : bigint,
    nanos : number
}

interface Send {
    to: Principal,
    fee: Doms,
    amount: Doms
};

interface Receive {
    fee: Doms,
    from: Principal,
    amount: Doms
};

type Transfer =
    { Burn : { amount : Doms } } |
    { Mint : { amount : Doms } } |
    { Send : Send } |
    { Receive : Receive };
