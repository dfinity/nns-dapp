import { Principal } from "@dfinity/principal";
import { Option } from "../option";
import { _SERVICE, ListNeurons } from "./rawService";
import ServiceInterface, {
  AddHotKeyRequest,
  ClaimOrRefreshNeuronFromAccount,
  ClaimOrRefreshNeuronRequest,
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
  MergeMaturityRequest,
  MergeMaturityResponse,
  NeuronInfo,
  NeuronInfoForHw,
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
import { submitUpdateRequest } from "../updateRequestHandler";
import { ManageNeuronResponse as PbManageNeuronResponse } from "../../proto/governance_pb";
import { Agent } from "@dfinity/agent";
import { calculateCrc32 } from "../converter";
import {
  ListNeurons as PbListNeurons,
  ListNeuronsResponse as PbListNeuronsResponse,
} from "../../proto/governance_pb";

export default class Service implements ServiceInterface {
  private readonly agent: Agent;
  private readonly canisterId: Principal;
  private readonly service: _SERVICE;
  private readonly myPrincipal: Principal;
  private readonly requestConverters: RequestConverters;
  private readonly responseConverters: ResponseConverters;

  public constructor(
    agent: Agent,
    canisterId: Principal,
    service: _SERVICE,
    myPrincipal: Principal
  ) {
    this.agent = agent;
    this.canisterId = canisterId;
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

  public getNeuronsForHW = async (): Promise<Array<NeuronInfoForHw>> => {
    const request = new PbListNeurons();
    request.setIncludeNeuronsReadableByCaller(true);

    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "list_neurons_pb",
      request.serializeBinary()
    );

    const response = PbListNeuronsResponse.deserializeBinary(rawResponse);
    const neurons = response.getFullNeuronsList();
    return neurons.map((neuron) => {
      const id = neuron.getId()?.getId();
      if (!id) {
        throw "Neuron must have an ID";
      }

      return {
        id: id,
        amount: neuron.getCachedNeuronStakeE8s(),
        hotKeys: neuron.getHotKeysList().map((principal) => {
          return Principal.fromUint8Array(
            principal.getSerializedId_asU8()
          ).toText();
        }),
      };
    });
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

    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      rawRequest.serializeBinary()
    );

    return toResponse(PbManageNeuronResponse.deserializeBinary(rawResponse));
  };

  public removeHotKey = async (
    request: RemoveHotKeyRequest
  ): Promise<EmptyResponse> => {
    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      this.requestConverters.fromRemoveHotKeyRequest(request).serializeBinary()
    );

    return toResponse(PbManageNeuronResponse.deserializeBinary(rawResponse));
  };

  public startDissolving = async (
    request: StartDissolvingRequest
  ): Promise<EmptyResponse> => {
    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      this.requestConverters
        .fromStartDissolvingRequest(request)
        .serializeBinary()
    );
    return toResponse(PbManageNeuronResponse.deserializeBinary(rawResponse));
  };

  public stopDissolving = async (
    request: StopDissolvingRequest
  ): Promise<EmptyResponse> => {
    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      this.requestConverters
        .fromStopDissolvingRequest(request)
        .serializeBinary()
    );
    return toResponse(PbManageNeuronResponse.deserializeBinary(rawResponse));
  };

  public increaseDissolveDelay = async (
    request: IncreaseDissolveDelayRequest
  ): Promise<EmptyResponse> => {
    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      this.requestConverters
        .fromIncreaseDissolveDelayRequest(request)
        .serializeBinary()
    );

    return toResponse(PbManageNeuronResponse.deserializeBinary(rawResponse));
  };

  public follow = async (request: FollowRequest): Promise<EmptyResponse> => {
    await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      this.requestConverters.fromFollowRequest(request).serializeBinary()
    );

    return { Ok: null };
  };

  public registerVote = async (
    request: RegisterVoteRequest
  ): Promise<EmptyResponse> => {
    await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      this.requestConverters.fromRegisterVoteRequest(request).serializeBinary()
    );
    return { Ok: null };
  };

  public spawn = async (request: SpawnRequest): Promise<SpawnResponse> => {
    const rawRequest = this.requestConverters.fromSpawnRequest(request);
    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      rawRequest.serializeBinary()
    );

    const response = PbManageNeuronResponse.deserializeBinary(rawResponse);
    return this.responseConverters.toSpawnResponse(response);
  };

  public split = async (request: SplitRequest): Promise<EmptyResponse> => {
    const rawRequest = this.requestConverters.fromSplitRequest(request);
    await this.service.manage_neuron(rawRequest);
    return { Ok: null };
  };

  public disburse = async (
    request: DisburseRequest
  ): Promise<DisburseResponse> => {
    // Verify the checksum of the given address.
    if (request.toAccountId) {
      if (request.toAccountId.length != 64) {
        throw `Invalid account identifier ${request.toAccountId}. The account identifier must be 64 chars in length.`;
      }

      const toAccountBytes = Buffer.from(request.toAccountId, "hex");
      const foundChecksum = toAccountBytes.slice(0, 4);
      const expectedCheckum = Buffer.from(
        calculateCrc32(toAccountBytes.slice(4))
      );
      if (!expectedCheckum.equals(foundChecksum)) {
        throw `Account identifier ${
          request.toAccountId
        } has an invalid checksum. Are you sure the account identifier is correct?\n\nExpected checksum: ${expectedCheckum.toString(
          "hex"
        )}\nFound checksum: ${foundChecksum.toString("hex")}`;
      }
    }

    const rawRequest = this.requestConverters.fromDisburseRequest(request);
    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      rawRequest.serializeBinary()
    );

    const response = PbManageNeuronResponse.deserializeBinary(rawResponse);
    return this.responseConverters.toDisburseResponse(response);
  };

  public disburseToNeuron = async (
    request: DisburseToNeuronRequest
  ): Promise<DisburseToNeuronResponse> => {
    const rawRequest =
      this.requestConverters.fromDisburseToNeuronRequest(request);
    const rawResponse = await this.service.manage_neuron(rawRequest);
    return this.responseConverters.toDisburseToNeuronResult(rawResponse);
  };

  public mergeMaturity = async (
    request: MergeMaturityRequest
  ): Promise<MergeMaturityResponse> => {
    const rawRequest = this.requestConverters.fromMergeMaturityRequest(request);
    console.log("in merge maturity");
    console.log(request);
    const rawResponse = await submitUpdateRequest(
      this.agent,
      this.canisterId,
      "manage_neuron_pb",
      rawRequest.serializeBinary()
    );
    const response = PbManageNeuronResponse.deserializeBinary(rawResponse);

    return this.responseConverters.toMergeMaturityResponse(response);
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

  public claimOrRefreshNeuron = async (
    request: ClaimOrRefreshNeuronRequest
  ): Promise<Option<NeuronId>> => {
    const rawRequest =
      this.requestConverters.fromClaimOrRefreshNeuronRequest(request);
    const rawResponse = await this.service.manage_neuron(rawRequest);
    // This log will come in handy when debugging user issues
    console.log(rawResponse);
    return this.responseConverters.toClaimOrRefreshNeuronResponse(rawResponse);
  };

  public claimOrRefreshNeuronFromAccount = async (
    request: ClaimOrRefreshNeuronFromAccount
  ): Promise<NeuronId> => {
    const response = await this.service.claim_or_refresh_neuron_from_account({
      controller: request.controller ? [request.controller] : [],
      memo: request.memo,
    });

    const result = response.result;
    if (result.length && "NeuronId" in result[0]) {
      return result[0].NeuronId.id;
    }

    throw `Error claiming/refreshing neuron: ${JSON.stringify(result)}`;
  };
}

/**
 * Convert a protobuf manage neuron response to an `EmptyResponse`.
 */
function toResponse(resp: PbManageNeuronResponse): EmptyResponse {
  const error = resp.getError();
  if (error) {
    return {
      Err: {
        errorMessage: error.getErrorMessage(),
        errorType: error.getErrorType(),
      },
    };
  } else {
    return { Ok: null };
  }
}
