import { Identity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService from "./canisters/governance/Service";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/Service";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import LedgerViewService from "./canisters/ledgerView/Service";
import { GetTransactionsRequest, GetTransactionsResponse } from "./canisters/ledgerView/model";
import { BlockHeight, GetBalanceRequest, ICPTs, SendICPTsRequest } from "./canisters/ledger/model";
import { ProposalInfo } from "./canisters/governance/model";

export default class WalletApi {
    private _governanceService: GovernanceService;
    private _ledgerService: LedgerService;
    private _ledgerViewService: LedgerViewService;

    constructor(host: string, identity: Identity) {
        this._ledgerService = ledgerBuilder(host, identity);
        this._ledgerViewService = ledgerViewBuilder(host, identity);
    }

    public async getBalance(request: GetBalanceRequest): Promise<ICPTs> {
        return this._ledgerService.getBalance(request);
    }

    public async getPendingProposals(): Promise<Array<ProposalInfo>> {
        return this._governanceService.getPendingProposals();
    }

    public async getTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse> {
        return this._ledgerViewService.getTransactions(request);
    }

    public async sendICPTs(request: SendICPTsRequest): Promise<BlockHeight> {
        return this._ledgerService.sendICPTs(request);
    }
}
