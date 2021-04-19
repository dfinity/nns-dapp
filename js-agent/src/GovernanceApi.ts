import { Option } from "./canisters/option";
import { HttpAgent, SignIdentity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import ledgerBuilder from "./canisters/ledger/builder";
import LedgerService from "./canisters/ledger/model";
import GovernanceService, {
    AddHotKeyRequest,
    DisburseRequest,
    DisburseResult,
    DisburseToNeuronRequest,
    DisburseToNeuronResult,
    EmptyResponse,
    FollowRequest,
    IncreaseDissolveDelayRequest,
    ListProposalsRequest,
    ListProposalsResponse,
    MakeMotionProposalRequest,
    MakeNetworkEconomicsProposalRequest,
    MakeProposalResult,
    MakeRewardNodeProviderProposalRequest,
    MakeSetDefaultFolloweesProposalRequest,
    NeuronInfo,
    RegisterVoteRequest,
    RemoveHotKeyRequest,
    SpawnRequest,
    SpawnResult,
    SplitRequest,
    StartDissolvingRequest,
    StopDissolvingRequest
} from "./canisters/governance/model";
import { ProposalInfo } from "./canisters/governance/model";
import createNeuronImpl, { CreateNeuronRequest, CreateNeuronResponse } from "./canisters/governance/createNeuron";
import ledgerViewBuilder from "./canisters/nnsUI/builder";

export default class GovernanceApi {
    private readonly governanceService: GovernanceService;
    private readonly ledgerService: LedgerService;
    private readonly identity: SignIdentity;

    constructor(host: string, identity: SignIdentity) {
        const agent = new HttpAgent({
            host,
            identity
        });
        this.ledgerService = ledgerBuilder(agent, identity);
        const ledgerViewService = ledgerViewBuilder(agent);
        this.governanceService = governanceBuilder(agent, identity, ledgerViewService.syncTransactions);
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

    public addHotKey = async (request: AddHotKeyRequest) : Promise<EmptyResponse> => {
        return this.governanceService.addHotKey(request);
    }

    public removeHotKey = async (request: RemoveHotKeyRequest) : Promise<EmptyResponse> => {
        return this.governanceService.removeHotKey(request);
    }

    public startDissolving = async (request: StartDissolvingRequest) : Promise<EmptyResponse> => {
        return this.governanceService.startDissolving(request);
    }

    public stopDissolving = async (request: StopDissolvingRequest) : Promise<EmptyResponse> => {
        return this.governanceService.stopDissolving(request);
    }        

    public increaseDissolveDelay = async (request: IncreaseDissolveDelayRequest) : Promise<EmptyResponse> => {
        return this.governanceService.increaseDissolveDelay(request);
    }

    public follow = async (request: FollowRequest) : Promise<EmptyResponse> => {
        return this.governanceService.follow(request);
    }

    public registerVote = async (request: RegisterVoteRequest) : Promise<EmptyResponse> => {
        return this.governanceService.registerVote(request);
    }

    public spawn = async (request: SpawnRequest) : Promise<SpawnResult> => {
        return this.governanceService.spawn(request);
    }

    public split = async (request: SplitRequest) : Promise<EmptyResponse> => {
        return this.governanceService.split(request);
    }

    public disburse = async (request: DisburseRequest) : Promise<DisburseResult> => {
        return this.governanceService.disburse(request);
    }

    public disburseToNeuron = async (request: DisburseToNeuronRequest) : Promise<DisburseToNeuronResult> => {
        return this.governanceService.disburseToNeuron(request);
    }

    public makeMotionProposal = async (request: MakeMotionProposalRequest) : Promise<MakeProposalResult> => {
        return this.governanceService.makeMotionProposal(request);
    }

    public makeNetworkEconomicsProposal = async (request: MakeNetworkEconomicsProposalRequest) : Promise<MakeProposalResult> => {
        return this.governanceService.makeNetworkEconomicsProposal(request);
    }

    public makeRewardNodeProviderProposal = async (request: MakeRewardNodeProviderProposalRequest) : Promise<MakeProposalResult> => {
        return this.governanceService.makeRewardNodeProviderProposal(request);
    }

    public makeSetDefaultFolloweesProposal = async (request: MakeSetDefaultFolloweesProposalRequest) : Promise<MakeProposalResult> => {
        return this.governanceService.makeSetDefaultFolloweesProposal(request);
    }

    public jsonString(object: Object): String{
        return JSON.stringify(object, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value // return everything else unchanged
        );
    }
}
