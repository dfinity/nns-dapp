import { Principal } from "@dfinity/agent";
import ServiceInterface, { BlockHeight, GetBalanceRequest, ICPTs, SendICPTsRequest } from "./model";
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

    public async getBalance(request: GetBalanceRequest): Promise<ICPTs> {
        const rawRequest = this.requestConverters.fromGetBalanceRequest(request, this.principal);
        const result = await this.service.account_balance(rawRequest);
        return this.responseConverters.toICPTs(result);
    }

    public async sendICPTs(request: SendICPTsRequest): Promise<BlockHeight> {
        const rawRequest = this.requestConverters.fromSendICPTsRequest(request);
        const result = await this.service.send(rawRequest);
        return this.responseConverters.toBlockHeight(result);
    }
}
