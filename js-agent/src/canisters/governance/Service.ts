import RawService from "./rawService";
import ServiceInterface, { ProposalInfo } from "./model";
import ResponseConverters from "./ResponseConverters";

export default class Service implements ServiceInterface {
    private readonly service: RawService;
    private responseConverters: ResponseConverters;

    public constructor(service: RawService) {
        this.service = service;
        this.responseConverters = new ResponseConverters();
    }

    public async getPendingProposals() : Promise<Array<ProposalInfo>> {
        const rawResponse = await this.service.get_pending_proposals();
        return this.responseConverters.convertGetPendingProposalsResponse(rawResponse);
    }
}
