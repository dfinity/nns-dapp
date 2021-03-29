import { AnonymousIdentity, SignIdentity } from "@dfinity/agent";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService, { AccountIdentifier } from "./canisters/ledger/model";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import LedgerViewService, { CreateSubAccountResponse, NamedSubAccount } from "./canisters/ledgerView/model";
import { GetTransactionsRequest, GetTransactionsResponse } from "./canisters/ledgerView/model";
import { BlockHeight, GetBalanceRequest, ICPTs, SendICPTsRequest } from "./canisters/ledger/model";

export default class LedgerApi {
    private readonly ledgerService: LedgerService;
    private readonly ledgerViewService: LedgerViewService;
    private readonly host: string;
    private readonly identity: SignIdentity;

    constructor(host: string, identity: SignIdentity) {
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
        await anonLedgerService.sendICPTs({
            to: this.identity.getPrincipal().toString(),
            amount: icpts
        });
    }

    public createSubAccount(name: string) : Promise<CreateSubAccountResponse> {
        return this.ledgerViewService.createSubAccount(name);
    }

    public async getAccount() : Promise<AccountDetails> {
        const response = await this.ledgerViewService.getAccount();
        if ("Ok" in response) {
            return response.Ok;
        } else {
            const accountIdentifier = await this.ledgerViewService.addAccount();
            return {
                accountIdentifier,
                subAccounts: []
            };
        }
    }

    public getBalance(request: GetBalanceRequest) : Promise<ICPTs> {
        return this.ledgerService.getBalance(request);
    }

    public getTransactions(request: GetTransactionsRequest) : Promise<GetTransactionsResponse> {
        return this.ledgerViewService.getTransactions(request);
    }

    public sendICPTs(request: SendICPTsRequest): Promise<BlockHeight> {
        return this.ledgerService.sendICPTs(request);
    }
}

export type AccountDetails = {
    accountIdentifier: AccountIdentifier,
    subAccounts: Array<NamedSubAccount>
}
