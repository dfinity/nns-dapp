import { Principal } from "@dfinity/principal";
import { Option } from "../option";
import RawService, { ListNeurons } from "./rawService";
import ServiceInterface, {
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
  NeuronInfo,
  ProposalInfo,
  RegisterVoteRequest,
  RemoveHotKeyRequest,
  SpawnRequest,
  SpawnResponse,
  SplitRequest,
  StartDissolvingRequest,
  StopDissolvingRequest,
} from "./model";
import RequestConverters from "./RequestConverters";
import ResponseConverters from "./ResponseConverters";
import { NeuronId } from "../common/types";

export default class Service implements ServiceInterface {
  private readonly service: RawService;
  private readonly myPrincipal: Principal;
  private readonly requestConverters: RequestConverters;
  private readonly responseConverters: ResponseConverters;

  public constructor(service: RawService, myPrincipal: Principal) {
    this.service = service;
    this.myPrincipal = myPrincipal;
    this.requestConverters = new RequestConverters(myPrincipal);
    this.responseConverters = new ResponseConverters();
  }

  public getNeuron = async (
    neuronId: NeuronId
  ): Promise<Option<NeuronInfo>> => {
    const rawRequest: ListNeurons = {
      neuron_ids: [neuronId],
      include_neurons_readable_by_caller: false,
    };
    const rawResponse = await this.service.list_neurons(rawRequest);
    const response = this.responseConverters.toArrayOfNeuronInfo(
      rawResponse,
      this.myPrincipal
    );
    return response.length > 0 ? response[0] : null;
  };

  public getNeurons = async (): Promise<Array<NeuronInfo>> => {
    const rawRequest: ListNeurons = {
      neuron_ids: [],
      include_neurons_readable_by_caller: true,
    };
    const rawResponse = await this.service.list_neurons(rawRequest);
    return this.responseConverters.toArrayOfNeuronInfo(
      rawResponse,
      this.myPrincipal
    );
  };

  public listProposals = async (
    request: ListProposalsRequest
  ): Promise<ListProposalsResponse> => {
    const rawRequest = this.requestConverters.fromListProposalsRequest(request);
    const rawResponse = await this.service.list_proposals(rawRequest);
    return this.responseConverters.toListProposalsResponse(rawResponse);
  };

  public getPendingProposals = async (): Promise<Array<ProposalInfo>> => {
    const rawResponse = await this.service.get_pending_proposals();
    return rawResponse.map(this.responseConverters.toProposalInfo);
  };

  public getProposalInfo = async (
    proposalId: bigint
  ): Promise<Option<ProposalInfo>> => {
    const rawResponse = await this.service.get_proposal_info(proposalId);
    return rawResponse.length
      ? this.responseConverters.toProposalInfo(rawResponse[0])
      : null;
  };

  public addHotKey = async (
    request: AddHotKeyRequest
  ): Promise<EmptyResponse> => {
    const rawRequest = this.requestConverters.fromAddHotKeyRequest(request);
    await this.service.manage_neuron(rawRequest);
    const response = await this.service.manage_neuron(rawRequest);
    console.log(response);
    return { Ok: null };
  };

  public removeHotKey = async (
    request: RemoveHotKeyRequest
  ): Promise<EmptyResponse> => {
    const rawRequest = this.requestConverters.fromRemoveHotKeyRequest(request);
    await this.service.manage_neuron(rawRequest);
    return { Ok: null };
  };

  public startDissolving = async (
    request: StartDissolvingRequest
  ): Promise<EmptyResponse> => {
    const rawRequest =
      this.requestConverters.fromStartDissolvingRequest(request);
    await this.service.manage_neuron(rawRequest);
    return { Ok: null };
  };

  public stopDissolving = async (
    request: StopDissolvingRequest
  ): Promise<EmptyResponse> => {
    const rawRequest =
      this.requestConverters.fromStopDissolvingRequest(request);
    await this.service.manage_neuron(rawRequest);
    return { Ok: null };
  };

  public increaseDissolveDelay = async (
    request: IncreaseDissolveDelayRequest
  ): Promise<EmptyResponse> => {
    const rawRequest =
      this.requestConverters.fromIncreaseDissolveDelayRequest(request);
    await this.service.manage_neuron(rawRequest);
    return { Ok: null };
  };

  public follow = async (request: FollowRequest): Promise<EmptyResponse> => {
    const rawRequest = this.requestConverters.fromFollowRequest(request);
    await this.service.manage_neuron(rawRequest);
    return { Ok: null };
  };

  public registerVote = async (
    request: RegisterVoteRequest
  ): Promise<EmptyResponse> => {
    const rawRequest = this.requestConverters.fromRegisterVoteRequest(request);
    await this.service.manage_neuron(rawRequest);
    return { Ok: null };
  };

  public spawn = async (request: SpawnRequest): Promise<SpawnResponse> => {
    const rawRequest = this.requestConverters.fromSpawnRequest(request);
    const rawResponse = await this.service.manage_neuron(rawRequest);
    return this.responseConverters.toSpawnResponse(rawResponse);
  };

  public split = async (request: SplitRequest): Promise<EmptyResponse> => {
    const rawRequest = this.requestConverters.fromSplitRequest(request);
    await this.service.manage_neuron(rawRequest);
    return { Ok: null };
  };

  public disburse = async (
    request: DisburseRequest
  ): Promise<DisburseResponse> => {
    const rawRequest = this.requestConverters.fromDisburseRequest(request);
    const rawResponse = await this.service.manage_neuron(rawRequest);
    return this.responseConverters.toDisburseResponse(rawResponse);
  };

  public disburseToNeuron = async (
    request: DisburseToNeuronRequest
  ): Promise<DisburseToNeuronResponse> => {
    const rawRequest =
      this.requestConverters.fromDisburseToNeuronRequest(request);
    const rawResponse = await this.service.manage_neuron(rawRequest);
    return this.responseConverters.toDisburseToNeuronResult(rawResponse);
  };

  public makeMotionProposal = async (
    request: MakeMotionProposalRequest
  ): Promise<MakeProposalResponse> => {
    const rawRequest =
      this.requestConverters.fromMakeMotionProposalRequest(request);
    const rawResponse = await this.service.manage_neuron(rawRequest);
    return this.responseConverters.toMakeProposalResponse(rawResponse);
  };

  public makeNetworkEconomicsProposal = async (
    request: MakeNetworkEconomicsProposalRequest
  ): Promise<MakeProposalResponse> => {
    const rawRequest =
      this.requestConverters.fromMakeNetworkEconomicsProposalRequest(request);
    const rawResponse = await this.service.manage_neuron(rawRequest);
    return this.responseConverters.toMakeProposalResponse(rawResponse);
  };

  public makeRewardNodeProviderProposal = async (
    request: MakeRewardNodeProviderProposalRequest
  ): Promise<MakeProposalResponse> => {
    const rawRequest =
      this.requestConverters.fromMakeRewardNodeProviderProposalRequest(request);
    const rawResponse = await this.service.manage_neuron(rawRequest);
    return this.responseConverters.toMakeProposalResponse(rawResponse);
  };

  public makeSetDefaultFolloweesProposal = async (
    request: MakeSetDefaultFolloweesProposalRequest
  ): Promise<MakeProposalResponse> => {
    const rawRequest =
      this.requestConverters.fromMakeSetDefaultFolloweesProposalRequest(
        request
      );
    const rawResponse = await this.service.manage_neuron(rawRequest);
    return this.responseConverters.toMakeProposalResponse(rawResponse);
  };
}
