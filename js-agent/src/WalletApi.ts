import { AnonymousIdentity, Identity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService, { ManageNeuron, ManageNeuronResponse } from "./canisters/governance/model";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/model";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import LedgerViewService from "./canisters/ledgerView/model";
import { GetTransactionsRequest, GetTransactionsResponse } from "./canisters/ledgerView/model";
import { BlockHeight, GetBalanceRequest, ICPTs, SendICPTsRequest } from "./canisters/ledger/model";
import { ProposalInfo } from "./canisters/governance/model";

export default class WalletApi {
    private governanceService: GovernanceService;
    private ledgerService: LedgerService;
    private ledgerViewService: LedgerViewService;
    private host: string;
    private identity: Identity;

    constructor(host: string, identity: Identity) {
        this.governanceService = governanceBuilder(host, identity);
        this.ledgerService = ledgerBuilder(host, identity);
        this.ledgerViewService = ledgerViewBuilder(host, identity);
        this.host = host;
        this.identity = identity;
    }

    // Temporary method for demo purposes only, to give the current principal some ICPTs 
    // by sending from the anon account which has been gifted lots of ICPTs
    public async acquireICPTs(icpts: ICPTs): Promise<void> {
        const anonIdentity = new AnonymousIdentity();
        const anonLedgerService = ledgerBuilder(this.host, anonIdentity);
        anonLedgerService.sendICPTs({
            to: this.identity.getPrincipal(),
            amount: icpts
        });
    }

    public async getBalance(request: GetBalanceRequest): Promise<ICPTs> {
        return this.ledgerService.getBalance(request);
    }

    public async getPendingProposals(): Promise<Array<ProposalInfo>> {
        return this.governanceService.getPendingProposals();
    }

    public async getTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse> {
        return this.ledgerViewService.getTransactions(request);
    }

    public async manageNeuron(request: ManageNeuron) : Promise<ManageNeuronResponse> {
        return this.governanceService.manageNeuron(request);   
    }

    public async sendICPTs(request: SendICPTsRequest): Promise<BlockHeight> {
        return this.ledgerService.sendICPTs(request);
    }
}
