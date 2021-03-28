import ServiceInterface, {
    CreateSubAccountResponse,
    GetTransactionsRequest,
    GetTransactionsResponse,
    NamedSubAccount
} from "./model";
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

    public async trackAccount() : Promise<undefined> {
        return await this.service.track_account();
    }

    public async createSubAccount(name: string) : Promise<CreateSubAccountResponse> {
        const rawResponse = await this.service.create_sub_account(name);
        return this.responseConverters.toCreateSubAccountResponse(rawResponse);
    }

    public async getTransactions(request: GetTransactionsRequest) : Promise<GetTransactionsResponse> {
        const rawRequest = this.requestConverters.fromGetTransactionsRequest(request);
        const rawResponse = await this.service.get_transactions(rawRequest);
        return this.responseConverters.toGetTransactionsResponse(rawResponse);
    }

    public async getSubAccounts() : Promise<Array<NamedSubAccount>> {
        const rawResponse = await this.service.get_sub_accounts();
        return rawResponse.map(this.responseConverters.toNamedSubAccount);
    }
}
