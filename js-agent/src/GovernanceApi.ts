import { Option } from "./canisters/option";
import { SignIdentity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/model";
import GovernanceService, { GetFullNeuronResponse, GetNeuronInfoResponse, ManageNeuron, ManageNeuronResponse } from "./canisters/governance/model";
import { ProposalInfo } from "./canisters/governance/model";
import createNeuronImpl, { CreateNeuronRequest, CreateNeuronResponse } from "./canisters/ledger/createNeuron";

export default class GovernanceApi {
    private readonly governanceService: GovernanceService;
    private readonly ledgerService: LedgerService;
    private readonly identity: SignIdentity;

    constructor(host: string, identity: SignIdentity) {
        this.ledgerService = ledgerBuilder(host, identity);
        this.governanceService = governanceBuilder(host, identity);
        this.identity = identity;
    }

    public async createNeuron(request: CreateNeuronRequest) : Promise<CreateNeuronResponse> {
        return createNeuronImpl(
            this.identity, 
            this.ledgerService, 
            this.governanceService, 
            request);
    }

    public getFullNeuron(neuronId: bigint) : Promise<GetFullNeuronResponse> {
        return this.governanceService.getFullNeuron(neuronId);
    }

    public getNeuronInfo(neuronId: bigint) : Promise<GetNeuronInfoResponse> {
        return this.governanceService.getNeuronInfo(neuronId);
    }

    public getFinalizedProposals() : Promise<Array<ProposalInfo>> {
        return this.governanceService.getFinalizedProposals();
    }

    public getNeuronIds() : Promise<Array<bigint>> {
        return this.governanceService.getNeuronIds();
    }

    public getPendingProposals(): Promise<Array<ProposalInfo>> {
        return this.governanceService.getPendingProposals();
    }

    public getProposalInfo(proposalId: bigint) : Promise<Option<ProposalInfo>> {
        return this.governanceService.getProposalInfo(proposalId);
    }

    public manageNeuron(request: ManageNeuron) : Promise<ManageNeuronResponse> {
        return this.governanceService.manageNeuron(request);   
    }
}
