import ServiceInterface, { GetTransactionsRequest, GetTransactionsResponse } from "./model";
import RawService from "./rawService";
import RequestConverters from "./RequestConverters";
import ResponseConverters from "./ResponseConverters";

export default class Service implements ServiceInterface {
    private readonly service: RawService;
    private requestConverters: RequestConverters;
    private responseConverters: ResponseConverters;

    public constructor(service: RawService) {
        this.service = service;
        this.requestConverters = new RequestConverters();
        this.responseConverters = new ResponseConverters();
    }

    public async getTransactions(request: GetTransactionsRequest) : Promise<GetTransactionsResponse> {
        const rawRequest = this.requestConverters.convertGetTransactionsRequest(request);
        const rawResponse = await this.service.get_transactions(rawRequest);
        return this.responseConverters.convertGetTransactionsResponse(rawResponse);
    }
}
