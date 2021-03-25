import { Identity } from "@dfinity/agent";
import ledgerBuilder from "./canisters/ledger/builder";
import getBalance from "./canisters/ledger/getBalance";
import sendICPTs, { SendICPTsRequest } from "./canisters/ledger/sendICPTs";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import { GetTransactionsRequest, GetTransactionsResponse } from "./canisters/ledgerView/model";

export default class LedgerApi {

    private _host: string;
    private _identity: Identity;

    constructor(host: string, identity: Identity) {
        this._host = host;
        this._identity = identity;
    }   

    public async getBalance(): Promise<bigint> {
        const service = ledgerBuilder(this._host, this._identity);
        return getBalance(service, this._identity.getPrincipal());
    }

    public async getTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse> {
        const service = ledgerViewBuilder(this._host, this._identity);
        return service.getTransactions(request);
    }

    public async sendICPTs(request: SendICPTsRequest) {
        const service = ledgerBuilder(this._host, this._identity);
        return sendICPTs(service, request);
    }
}
