import RawService from "./rawService";
import ServiceInterface, { GetFullNeuronResponse, GetNeuronInfoResponse, ManageNeuron, ManageNeuronResponse, ProposalInfo } from "./model";
import RequestConverters from "./RequestConverters";
import ResponseConverters from "./ResponseConverters";
import { bigIntToBigNumber } from "../converters";

export default class Service implements ServiceInterface {
    private readonly service: RawService;
    private readonly requestConverters: RequestConverters;
    private readonly responseConverters: ResponseConverters;

    public constructor(service: RawService) {
        this.service = service;
        this.requestConverters = new RequestConverters();
        this.responseConverters = new ResponseConverters();
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

    public async getPendingProposals() : Promise<Array<ProposalInfo>> {
        const rawResponse = await this.service.get_pending_proposals();
        return rawResponse.map(this.responseConverters.toProposalInfo);
    }

    public async manageNeuron(request: ManageNeuron) : Promise<ManageNeuronResponse> {
        const rawRequest = this.requestConverters.fromManageNeuron(request);
        const rawResponse = await this.service.manage_neuron(rawRequest);
        return this.responseConverters.toManageNeuronResponse(rawResponse);
    }
}
