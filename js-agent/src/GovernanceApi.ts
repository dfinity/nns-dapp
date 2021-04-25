import { Option } from "./canisters/option";
import { HttpAgent, SignIdentity } from "@dfinity/agent";
import governanceBuilder from "./canisters/governance/builder";
import GovernanceService, {
    AddHotKeyRequest,
    DisburseRequest,
    DisburseResponse,
    DisburseToNeuronRequest,
    DisburseToNeuronResponse,
    EmptyResponse,
    FollowRequest,
    IncreaseDissolveDelayRequest,
    ListProposalsRequest,
    ListProposalsResponse,
    MakeMotionProposalRequest,
    MakeNetworkEconomicsProposalRequest,
    MakeProposalResponse,
    MakeRewardNodeProviderProposalRequest,
    MakeSetDefaultFolloweesProposalRequest,
    NeuronId,
    NeuronInfo,
    RegisterVoteRequest,
    RemoveHotKeyRequest,
    SpawnRequest,
    SpawnResponse,
    SplitRequest,
    StartDissolvingRequest,
    StopDissolvingRequest
} from "./canisters/governance/model";
import { ProposalInfo } from "./canisters/governance/model";
import ledgerViewBuilder from "./canisters/nnsUI/builder";

export default class GovernanceApi {
    private readonly governanceService: GovernanceService;

    constructor(host: string, identity: SignIdentity) {
        const agent = new HttpAgent({
            host,
            identity
        });
        const ledgerViewService = ledgerViewBuilder(agent);
        this.governanceService = governanceBuilder(agent, identity, ledgerViewService.syncTransactions);
    }

    public getNeuron = (neuronId: NeuronId) : Promise<Option<NeuronInfo>> => {
        return this.governanceService.getNeuron(neuronId);
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
        console.log(request);
        return this.governanceService.increaseDissolveDelay(request);
    }

    public follow = async (request: FollowRequest) : Promise<EmptyResponse> => {
        return this.governanceService.follow(request);
    }

    public registerVote = async (request: RegisterVoteRequest) : Promise<EmptyResponse> => {
        return this.governanceService.registerVote(request);
    }

    public spawn = async (request: SpawnRequest) : Promise<SpawnResponse> => {
        return this.governanceService.spawn(request);
    }

    public split = async (request: SplitRequest) : Promise<EmptyResponse> => {
        return this.governanceService.split(request);
    }

    public disburse = async (request: DisburseRequest) : Promise<DisburseResponse> => {
        return this.governanceService.disburse(request);
    }

    public disburseToNeuron = async (request: DisburseToNeuronRequest) : Promise<DisburseToNeuronResponse> => {
        return this.governanceService.disburseToNeuron(request);
    }

    public makeMotionProposal = async (request: MakeMotionProposalRequest) : Promise<MakeProposalResponse> => {
        return this.governanceService.makeMotionProposal(request);
    }

    public makeNetworkEconomicsProposal = async (request: MakeNetworkEconomicsProposalRequest) : Promise<MakeProposalResponse> => {
        return this.governanceService.makeNetworkEconomicsProposal(request);
    }

    public makeRewardNodeProviderProposal = async (request: MakeRewardNodeProviderProposalRequest) : Promise<MakeProposalResponse> => {
        return this.governanceService.makeRewardNodeProviderProposal(request);
    }

    public makeSetDefaultFolloweesProposal = async (request: MakeSetDefaultFolloweesProposalRequest) : Promise<MakeProposalResponse> => {
        return this.governanceService.makeSetDefaultFolloweesProposal(request);
    }
}
