import { GetTransactionsRequest } from "./model";
import { GetTransactionsRequest as RawGetTransactionsRequest } from "./rawService";

export default class RequestConverters {
    public fromGetTransactionsRequest(request: GetTransactionsRequest) : RawGetTransactionsRequest {
        return {
            offset: request.offset,
            page_size: request.pageSize
        };
    }
}
