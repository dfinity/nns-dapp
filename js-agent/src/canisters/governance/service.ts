import RawService from "./rawService";
import ServiceInterface, { ProposalInfo } from "./model";
import responseConverter from "./responseConverter";

export default class Service implements ServiceInterface {
    private readonly service: RawService;
    public constructor(service: RawService) {
        this.service = service;
    }

    public async getPendingProposals() : Promise<Array<ProposalInfo>> {
        const rawResponse = await this.service.get_pending_proposals();

        return responseConverter.convertGetPendingProposalsResponse(rawResponse);
    }
}
