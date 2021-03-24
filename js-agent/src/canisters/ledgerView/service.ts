import RawService from "./rawService";
import { GetTransactionsRequest, GetTransactionsResponse } from "./model";
import requestConverter from "./requestConverter";
import responseConverter from "./responseConverter";

export default class Service {
    private readonly service: RawService;
    public constructor(service: RawService) {
        this.service = service;
    }

    public async getTransactions(request: GetTransactionsRequest) : Promise<GetTransactionsResponse> {
        const rawRequest = requestConverter.convertGetTransactionsRequest(request);

        const rawResponse = await this.service.get_transactions(rawRequest);

        return responseConverter.convertGetTransactionsResponse(rawResponse);
    }
}
