import { Principal } from "@dfinity/agent";
import BigNumber from "bignumber.js";
import { Option } from "../option";
import RawService from "./rawService";
import ServiceInterface, {
    AddHotKeyRequest,
    ClaimNeuronRequest,
    ClaimNeuronResponse,
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
    MakeProposalResult,
    NeuronInfo,
    ProposalInfo,
    RegisterVoteRequest,
    RemoveHotKeyRequest,
    SpawnRequest,
    SpawnResult,
    SplitRequest,
    StartDissolvingRequest,
    StopDissolvingRequest
} from "./model";
import RequestConverters from "./RequestConverters";
import ResponseConverters from "./ResponseConverters";
import { bigIntToBigNumber, bigNumberToBigInt } from "../converter";

export default class Service implements ServiceInterface {
    private readonly service: RawService;
    private readonly syncTransactions: () => void;
    private readonly requestConverters: RequestConverters;
    private readonly responseConverters: ResponseConverters;

    public constructor(service: RawService, syncTransactions: () => void, myPrincipal: Principal) {
        this.service = service;
        this.syncTransactions = syncTransactions;
        this.requestConverters = new RequestConverters(myPrincipal);
        this.responseConverters = new ResponseConverters();
    }

    public claimNeuron = async (request: ClaimNeuronRequest) : Promise<ClaimNeuronResponse> => {
        const [principal, nonce, dissolveDelay] = this.requestConverters.fromClaimNeuronRequest(request);
        const rawResponse = await this.service.claim_neuron(principal, nonce, dissolveDelay);
        return this.responseConverters.toClaimNeuronResponse(rawResponse);        
    }

    public getNeurons = async () : Promise<Array<NeuronInfo>> => {
        const neuronIds = await this.service.get_neuron_ids();
        if (!neuronIds.length) {
            return [];
        }

        const promises: Promise<NeuronInfo>[] = neuronIds.map(async (id: BigNumber) : Promise<NeuronInfo> => {
            const neuronInfoPromise = this.service.get_neuron_info(id);
            const fullNeuronPromise = this.service.get_full_neuron(id);
            const rawResponses = await Promise.all([neuronInfoPromise, fullNeuronPromise]);
            const neuronInfoResponse = this.responseConverters.toNeuronInfoResponse(id, rawResponses[0], rawResponses[1]);
            if ("Ok" in neuronInfoResponse) {
                return neuronInfoResponse.Ok;
            }
            throw new Error("Failed to retrieve neuron info. NeuronId: " + bigNumberToBigInt(id));
        });

        return await Promise.all(promises);
    }

    public listProposals = async (request: ListProposalsRequest) : Promise<ListProposalsResponse> => {
        const rawRequest = this.requestConverters.fromListProposalsRequest(request);
        const rawResponse = await this.service.list_proposals(rawRequest);
        return this.responseConverters.toListProposalsResponse(rawResponse);
    }

    public getPendingProposals = async () : Promise<Array<ProposalInfo>> => {
        const rawResponse = await this.service.get_pending_proposals();
        return rawResponse.map(this.responseConverters.toProposalInfo);
    }

    public getProposalInfo = async (proposalId: bigint) : Promise<Option<ProposalInfo>> => {
        const rawResponse = await this.service.get_proposal_info(bigIntToBigNumber(proposalId));
        return rawResponse.length ? this.responseConverters.toProposalInfo(rawResponse[0]) : null;
    }

    public addHotKey = async (request: AddHotKeyRequest) : Promise<EmptyResponse> => {
        const rawRequest = this.requestConverters.fromAddHotKeyRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toEmptyResponse(rawResponse);
    }
    
    public removeHotKey = async (request: RemoveHotKeyRequest) : Promise<EmptyResponse> => {
        const rawRequest = this.requestConverters.fromRemoveHotKeyRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toEmptyResponse(rawResponse);
    }

    public startDissolving = async (request: StartDissolvingRequest) : Promise<EmptyResponse> => {
        const rawRequest = this.requestConverters.fromStartDissolvingRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toEmptyResponse(rawResponse);
    }

    public stopDissolving = async (request: StopDissolvingRequest) : Promise<EmptyResponse> => {
        const rawRequest = this.requestConverters.fromStopDissolvingRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toEmptyResponse(rawResponse);
    }

    public increaseDissolveDelay = async (request: IncreaseDissolveDelayRequest) : Promise<EmptyResponse> => {
        const rawRequest = this.requestConverters.fromIncreaseDissolveDelayRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toEmptyResponse(rawResponse);
    }

    public follow = async (request: FollowRequest) : Promise<EmptyResponse> => {
        const rawRequest = this.requestConverters.fromFollowRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toEmptyResponse(rawResponse);
    }

    public registerVote = async (request: RegisterVoteRequest) : Promise<EmptyResponse> => {
        const rawRequest = this.requestConverters.fromRegisterVoteRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toEmptyResponse(rawResponse);
    }

    public spawn = async (request: SpawnRequest) : Promise<SpawnResult> => {
        const rawRequest = this.requestConverters.fromSpawnRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toSpawnResult(rawResponse);
    }

    public split = async (request: SplitRequest) : Promise<EmptyResponse> => {
        const rawRequest = this.requestConverters.fromSplitRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toEmptyResponse(rawResponse);
    }

    public disburse = async (request: DisburseRequest) : Promise<DisburseResult> => {
        const rawRequest = this.requestConverters.fromDisburseRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        const response = this.responseConverters.toDisburseResult(rawResponse);
        if ("Ok" in response) {
            this.syncTransactions();
        }
        return response
    }

    public disburseToNeuron = async (request: DisburseToNeuronRequest) : Promise<DisburseToNeuronResult> => {
        const rawRequest = this.requestConverters.fromDisburseToNeuronRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toDisburseToNeuronResult(rawResponse);
    }

    public makeMotionProposal = async (request: MakeMotionProposalRequest) : Promise<MakeProposalResult> => {
        const rawRequest = this.requestConverters.fromMakeMotionProposalRequest(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toMakeProposalResult(rawResponse);
    }
}
