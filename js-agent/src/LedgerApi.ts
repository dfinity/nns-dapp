import { AnonymousIdentity, Identity, Principal } from "@dfinity/agent";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/model";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import LedgerViewService, { CreateSubAccountResponse, NamedSubAccount } from "./canisters/ledgerView/model";
import { GetTransactionsRequest, GetTransactionsResponse } from "./canisters/ledgerView/model";
import { BlockHeight, GetBalanceRequest, ICPTs, SendICPTsRequest } from "./canisters/ledger/model";

export default class LedgerApi {
    private ledgerService: LedgerService;
    private ledgerViewService: LedgerViewService;
    private host: string;
    private identity: Identity;

    constructor(host: string, identity: Identity) {
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
            to: this.identity.getPrincipal().toString(),
            amount: icpts
        });
    }

    public async createSubAccount(name: string) : Promise<CreateSubAccountResponse> {
        return this.ledgerViewService.createSubAccount(name);
    }

    public async getAccount() : Promise<AccountDetails> {
        const defaultAccount = this.identity.getPrincipal();
        const response = await this.ledgerViewService.getAccount();
        let subAccounts: Array<NamedSubAccount>;
        if ("Ok" in response) {
            subAccounts = response.Ok.subAccounts;
        } else {
            await this.ledgerViewService.addAccount();
            subAccounts = [];
        }

        return {
            defaultAccount,
            subAccounts
        }
    }

    public async getBalance(request: GetBalanceRequest) : Promise<ICPTs> {
        return this.ledgerService.getBalance(request);
    }

    public async getTransactions(request: GetTransactionsRequest) : Promise<GetTransactionsResponse> {
        return this.ledgerViewService.getTransactions(request);
    }

    public async sendICPTs(request: SendICPTsRequest): Promise<BlockHeight> {
        return this.ledgerService.sendICPTs(request);
    }
}

export type AccountDetails = {
    defaultAccount: Principal,
    subAccounts: Array<NamedSubAccount>
}
