import { Option } from "./canisters/option";
import { SignIdentity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/model";
import GovernanceService, {
    ListProposalsRequest,
    ListProposalsResponse,
    ManageNeuron,
    ManageNeuronResponse,
    NeuronInfo
} from "./canisters/governance/model";
import { ProposalInfo } from "./canisters/governance/model";
import createNeuronImpl, { CreateNeuronRequest, CreateNeuronResponse } from "./canisters/governance/createNeuron";
import ledgerViewBuilder from "./canisters/ledgerView/builder";

export default class GovernanceApi {
    private readonly governanceService: GovernanceService;
    private readonly ledgerService: LedgerService;
    private readonly identity: SignIdentity;

    constructor(host: string, identity: SignIdentity) {
        this.ledgerService = ledgerBuilder(host, identity);
        const ledgerViewService = ledgerViewBuilder(host, identity);
        this.governanceService = governanceBuilder(host, identity, ledgerViewService.syncTransactions);
        this.identity = identity;
    }

    public createNeuron = async (request: CreateNeuronRequest) : Promise<CreateNeuronResponse> => {
        return createNeuronImpl(
            this.identity, 
            this.ledgerService, 
            this.governanceService, 
            request);
    }

    public getNeurons = () : Promise<Array<NeuronInfo>> => {
        return this.governanceService.getNeurons();
    }

    public getPendingProposals = (): Promise<Array<ProposalInfo>> => {
        return this.governanceService.getPendingProposals();
    }

    public getProposalInfo = (proposalId: bigint) : Promise<Option<ProposalInfo>> => {
        return this.governanceService.getProposalInfo(proposalId);
    }

    public listProposals = (request: ListProposalsRequest) : Promise<ListProposalsResponse> => {
        return this.governanceService.listProposals(request);
    }

    public manageNeuron = (request: ManageNeuron) : Promise<ManageNeuronResponse> => {
        return this.governanceService.manageNeuron(request);   
    }
}
