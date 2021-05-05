import RawService from "./rawService";
import ServiceInterface, { UpdateSettingsRequest } from "./model";

export default class Service implements ServiceInterface {
    private readonly service: RawService;

    public constructor(service: RawService) {
        this.service = service;
    }

    public updateSettings = async (request: UpdateSettingsRequest) : Promise<void> => {
        const settings = request.settings;
        await this.service.update_settings({
            canister_id: request.canisterId, 
            settings: {
                controller: settings.controller ? [settings.controller] : [],
                freezing_threshold: settings.freezingThreshold ? [settings.freezingThreshold] : [],
                memory_allocation: settings.memoryAllocation ? [settings.memoryAllocation] : [],
                compute_allocation: settings.computeAllocation ? [settings.computeAllocation] : [],
            }
        });
    }
}