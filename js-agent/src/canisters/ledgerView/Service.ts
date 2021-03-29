import { AccountIdentifier } from "../ledger/model";
import ServiceInterface, {
    CreateSubAccountResponse,
    GetAccountResponse,
    GetTransactionsRequest,
    GetTransactionsResponse
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

    public async getAccount() : Promise<GetAccountResponse> {
        const rawResponse = await this.service.get_account();
        return this.responseConverters.toGetAccountResponse(rawResponse);
    }

    public addAccount() : Promise<AccountIdentifier> {
        return this.service.add_account();
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
}
