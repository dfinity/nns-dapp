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

    public async claimNeuron(request: ClaimNeuronRequest) : Promise<ClaimNeuronResponse> {
        const rawRequest = this.requestConverters.fromClaimNeuronRequest(request);
        const rawResponse = await this.service.claim_neuron(rawRequest[0], rawRequest[1], rawRequest[2]);
        return this.responseConverters.toClaimNeuronResponse(rawResponse);        
    }

    public async getFullNeuron(neuronId: bigint) : Promise<GetFullNeuronResponse> {
        const rawNeuronId = bigIntToBigNumber(neuronId);
        const rawResponse = await this.service.get_full_neuron(rawNeuronId);
        return this.responseConverters.toFullNeuronResponse(rawResponse);
    }

    public async getNeuronInfo(neuronId: bigint) : Promise<GetNeuronInfoResponse> {
        const rawNeuronId = bigIntToBigNumber(neuronId);
        const rawResponse = await this.service.get_neuron_info(rawNeuronId);
        return this.responseConverters.toNeuronInfoResponse(rawResponse);        
    }

    public async getFinalizedProposals() : Promise<Array<ProposalInfo>> {
        const rawResponse = await this.service.get_finalized_proposals();
        return rawResponse.map(this.responseConverters.toProposalInfo);
    }

    public async getNeuronIds() : Promise<Array<bigint>> {
        const rawResponse = await this.service.get_neuron_ids();
        return rawResponse.map(bigNumberToBigInt);
    }

    public async getPendingProposals() : Promise<Array<ProposalInfo>> {
        const rawResponse = await this.service.get_pending_proposals();
        return rawResponse.map(this.responseConverters.toProposalInfo);
    }

    public async getProposalInfo(proposalId: bigint) : Promise<Option<ProposalInfo>> {
        const rawResponse = await this.service.get_proposal_info(bigIntToBigNumber(proposalId));
        return rawResponse.length ? this.responseConverters.toProposalInfo(rawResponse[0]) : null;
    }

    public async manageNeuron(request: ManageNeuron) : Promise<ManageNeuronResponse> {
        const rawRequest = this.requestConverters.fromManageNeuron(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toManageNeuronResponse(rawResponse);
    }
}
