import { GetTransactionsRequest } from "./model";
import { GetTransactionsRequest as RawGetTransactionsRequest } from "./rawService";

class RequestConverter {
    public convertGetTransactionsRequest(request: GetTransactionsRequest) : RawGetTransactionsRequest {
        return {
            offset: request.offset,
            page_size: request.pageSize
        };
    }
}

const converter = new RequestConverter();

export default converter;
