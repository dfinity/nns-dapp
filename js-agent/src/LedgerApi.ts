import { AnonymousIdentity, SignIdentity } from "@dfinity/agent";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService, {
    AccountIdentifier,
    BlockHeight,
    GetBalancesRequest,
    ICPTs,
    SendICPTsRequest
} from "./canisters/ledger/model";
import ledgerViewBuilder from "./canisters/ledgerView/builder";
import LedgerViewService, {
    CreateSubAccountResponse,
    GetTransactionsRequest,
    GetTransactionsResponse,
    NamedSubAccount
} from "./canisters/ledgerView/model";

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

    // Temporary method for demo purposes only, to give the specified account some ICPTs
    // by sending from the anon account which has been gifted lots of ICPTs
    public acquireICPTs = async (accountIdentifier: AccountIdentifier, icpts: ICPTs): Promise<void> => {
        console.log("Account id " + accountIdentifier + " ICPTs " + icpts.doms);
        const anonIdentity = new AnonymousIdentity();
        const anonLedgerService = ledgerBuilder(this.host, anonIdentity);
        await anonLedgerService.sendICPTs({
            to: accountIdentifier,
            amount: icpts
        });
        await this.ledgerViewService.syncTransactions();
    }

    public createSubAccount = (name: string) : Promise<CreateSubAccountResponse> => {
        return this.ledgerViewService.createSubAccount(name);
    }

    public getAccount = async () : Promise<AccountDetails> => {
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

    public getBalances = (request: GetBalancesRequest) : Promise<{}> => {
        console.log("accounts : " + request.accounts);
        return this.ledgerService.getBalances(request);
    }

    public getTransactions = (request: GetTransactionsRequest) : Promise<GetTransactionsResponse> => {
        return this.ledgerViewService.getTransactions(request);
    }

    public sendICPTs = async (request: SendICPTsRequest): Promise<BlockHeight> => {
        const response = await this.ledgerService.sendICPTs(request);
        this.ledgerViewService.syncTransactions();
        return response;
    }
}

export type AccountDetails = {
    accountIdentifier: AccountIdentifier,
    subAccounts: Array<NamedSubAccount>
}
