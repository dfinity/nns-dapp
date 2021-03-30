import { Principal } from "@dfinity/agent";
import ServiceInterface, {
    BlockHeight,
    GetBalancesRequest,
    NotifyCanisterRequest,
    SendICPTsRequest
} from "./model";
import RawService from "./rawService";
import RequestConverters from "./RequestConverters";
import ResponseConverters from "./ResponseConverters";

export default class Service implements ServiceInterface {
    private readonly service: RawService;
    private principal: Principal
    private requestConverters: RequestConverters;
    private responseConverters: ResponseConverters;

    public constructor(service: RawService, principal: Principal) {
        this.service = service;
        this.principal = principal;
        this.requestConverters = new RequestConverters();
        this.responseConverters = new ResponseConverters();
    }

    public async getBalances(request: GetBalancesRequest): Promise<{}> {
        const rawRequests = this.requestConverters.fromGetBalancesRequest(request);
        const promises = rawRequests.map(async r => {
            const rawResponse = await this.service.account_balance(r);
            return this.responseConverters.toICPTs(rawResponse);
        });
        const balances = await Promise.all(promises);

        const result = {};
        request.accounts.forEach((a, index) => {
            result[a] = balances[index];
        })
        return result;
    }

    public async sendICPTs(request: SendICPTsRequest): Promise<BlockHeight> {
        const rawRequest = this.requestConverters.fromSendICPTsRequest(request);
        const result = await this.service.send(rawRequest);
        return this.responseConverters.toBlockHeight(result);
    }

    public async notify(request: NotifyCanisterRequest): Promise<void> {
        const rawRequest = this.requestConverters.fromNotifyCanisterRequest(request);
        await this.service.notify(rawRequest);
    }
}
