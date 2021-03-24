import RawService, {
    BlockHeight,
    GetTransactionsRequest as RawGetTransactionsRequest,
    Timestamp,
    Transaction as RawTransaction, Transfer
} from "./rawService";
import { Principal } from "@dfinity/agent";

export default class Service {
    private readonly service: RawService;
    public constructor(service: RawService, principal: Principal) {
        this.service = service;
    }

    public async getTransactions(request: GetTransactionsRequest) : Promise<GetTransationsResponse> {
        const rawRequest: RawGetTransactionsRequest = {
            offset: request.offset,
            page_size: request.pageSize
        };

        const rawResponse = await this.service.get_transactions(rawRequest);

        const response: GetTransactionsResponse = {

        }
    }
}

interface GetTransactionsRequest {
    offset: number,
    pageSize: number
}

interface GetTransactionsResponse {
    total : number,
    transactions : Array<RawTransaction>,
}

interface Transaction {
    timestamp : Timestamp,
    blockHeight : BlockHeight,
    transfer : Transfer,
}
