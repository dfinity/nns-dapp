import { Option } from "../option";
import RawService from "./rawService";
import ServiceInterface, { ClaimNeuronRequest, ClaimNeuronResponse, GetFullNeuronResponse, GetNeuronInfoResponse, ManageNeuron, ManageNeuronResponse, ProposalInfo } from "./model";
import RequestConverters from "./RequestConverters";
import ResponseConverters from "./ResponseConverters";
import { bigIntToBigNumber, bigNumberToBigInt } from "../converters";

export default class Service implements ServiceInterface {
    private readonly service: RawService;
    private readonly requestConverters: RequestConverters;
    private readonly responseConverters: ResponseConverters;

    public constructor(service: RawService) {
        this.service = service;
        this.requestConverters = new RequestConverters();
        this.responseConverters = new ResponseConverters();
    }

    public claimNeuron = async (request: ClaimNeuronRequest) : Promise<ClaimNeuronResponse> => {
        const [principal, nonce, dissolveDelay] = this.requestConverters.fromClaimNeuronRequest(request);
        const rawResponse = await this.service.claim_neuron(principal, nonce, dissolveDelay);
        return this.responseConverters.toClaimNeuronResponse(rawResponse);        
    }

    public getFullNeuron = async (neuronId: bigint) : Promise<GetFullNeuronResponse> => {
        const rawNeuronId = bigIntToBigNumber(neuronId);
        const rawResponse = await this.service.get_full_neuron(rawNeuronId);
        return this.responseConverters.toFullNeuronResponse(rawResponse);
    }

    public getNeuronInfo = async (neuronId: bigint) : Promise<GetNeuronInfoResponse> => {
        const rawNeuronId = bigIntToBigNumber(neuronId);
        const rawResponse = await this.service.get_neuron_info(rawNeuronId);
        return this.responseConverters.toNeuronInfoResponse(rawResponse);        
    }

    public getFinalizedProposals = async () : Promise<Array<ProposalInfo>> => {
        const rawResponse = await this.service.get_finalized_proposals();
        return rawResponse.map(this.responseConverters.toProposalInfo);
    }

    public getNeuronIds = async () : Promise<Array<bigint>> => {
        const rawResponse = await this.service.get_neuron_ids();
        return rawResponse.map(bigNumberToBigInt);
    }

    public getPendingProposals = async () : Promise<Array<ProposalInfo>> => {
        const rawResponse = await this.service.get_pending_proposals();
        return rawResponse.map(this.responseConverters.toProposalInfo);
    }

    public getProposalInfo = async (proposalId: bigint) : Promise<Option<ProposalInfo>> => {
        const rawResponse = await this.service.get_proposal_info(bigIntToBigNumber(proposalId));
        return rawResponse.length ? this.responseConverters.toProposalInfo(rawResponse[0]) : null;
    }

    public manageNeuron = async (request: ManageNeuron) : Promise<ManageNeuronResponse> => {
        const rawRequest = this.requestConverters.fromManageNeuron(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toManageNeuronResponse(rawResponse);
    }
}
