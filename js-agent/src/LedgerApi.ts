import { Agent, AnonymousIdentity, HttpAgent, SignIdentity } from "@dfinity/agent";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService, {
    AccountIdentifier,
    BlockHeight,
    GetBalancesRequest,
    Doms,
    SendICPTsRequest
} from "./canisters/ledger/model";
import ledgerViewBuilder from "./canisters/nnsUI/builder";
import LedgerViewService, {
    CreateSubAccountResponse,
    GetTransactionsRequest,
    GetTransactionsResponse,
    NamedSubAccount
} from "./canisters/nnsUI/model";
import { create_dummy_proposals, test_happy_path } from "./tests";

export default class LedgerApi {
    private readonly ledgerService: LedgerService;
    private readonly ledgerViewService: LedgerViewService;
    private readonly agent: Agent;
    private readonly host: string;
    private readonly identity: SignIdentity;

    constructor(host: string, identity: SignIdentity) {
        const agent = new HttpAgent({
            host,
            identity
        });
        this.ledgerService = ledgerBuilder(agent, identity);
        this.ledgerViewService = ledgerViewBuilder(agent);
        this.agent = agent;
        this.host = host;
        this.identity = identity;
    }

    // Temporary method for demo purposes only, to give the specified account some ICPTs
    // by sending from the anon account which has been gifted lots of ICPTs
    public acquireICPTs = async (accountIdentifier: AccountIdentifier, doms: Doms): Promise<void> => {
        const anonIdentity = new AnonymousIdentity();
        const anonLedgerService = ledgerBuilder(this.agent, anonIdentity);
        await anonLedgerService.sendICPTs({
            to: accountIdentifier,
            amount: doms
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

    public getBalances = (request: GetBalancesRequest) : Promise<Record<AccountIdentifier, Doms>> => {
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

    public integrationTest = async (): Promise<void> => {
        return await test_happy_path(this.host, this.identity);
    }

    public createDummyProposals = async (neuronId: bigint): Promise<void> => {
        return await create_dummy_proposals(this.host, this.identity, neuronId);
    }

    public jsonString(object: Object): String{
        return JSON.stringify(object, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        );
    }
}

export type AccountDetails = {
    accountIdentifier: AccountIdentifier,
    subAccounts: Array<NamedSubAccount>
}
