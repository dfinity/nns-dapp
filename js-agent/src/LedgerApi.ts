import { Identity, Principal } from "@dfinity/agent";
import ledgerBuilder from "./canisters/ledger/builder";
import getBalance from "./canisters/ledger/getBalance";
import sendICPTs, { SendICPTsRequest } from "./canisters/ledger/sendICPTs";
import LedgerService from "./canisters/ledger/service";
import LedgerViewService from "./canisters/ledgerView/service";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import { GetTransactionsRequest, GetTransactionsResponse } from "./canisters/ledgerView/model";

export default class LedgerApi {
    private _ledgerService: LedgerService;
    private _ledgerViewService: LedgerViewService;
    private _principal: Principal

    constructor(host: string, identity: Identity) {
        this._ledgerService = ledgerBuilder(host, identity);
        this._ledgerViewService = ledgerViewBuilder(host, identity);
    }

    public async getBalance(): Promise<bigint> {
        return getBalance(this._ledgerService, this._principal);
    }

    public async getTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse> {
        return this._ledgerViewService.getTransactions(request);
    }

    public async sendICPTs(request: SendICPTsRequest) {
        return sendICPTs(this._ledgerService, request);
    }
}
