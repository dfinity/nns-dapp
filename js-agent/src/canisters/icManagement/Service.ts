import RawService from "./rawService";
import ServiceInterface, { CanisterStatus, CanisterStatusResponse, UpdateSettingsRequest } from "./model";
import { CanisterId } from "../common/types";
import * as convert from "../converter";

export default class Service implements ServiceInterface {
    private readonly service: RawService;

    public constructor(service: RawService) {
        this.service = service;
    }

    public getCanisterStatus = async (canisterId: CanisterId) : Promise<CanisterStatusResponse> => {
        const rawResponse = await this.service.canister_status({ canister_id: canisterId });

        let status: CanisterStatus;
        if ("stopped" in rawResponse.status) {
            status = CanisterStatus.Stopped;
        } else if ("stopping" in rawResponse.status) {
            status = CanisterStatus.Stopping;        
        } else if ("running" in rawResponse.status) {
            status = CanisterStatus.Running;        
        }

        return {
            status: status,
            memorySize: rawResponse.memory_size,
            cycles: rawResponse.cycles,
            setting: {
                controller: rawResponse.settings.controller,
                freezingThreshold: rawResponse.settings.freezing_threshold,
                memoryAllocation: rawResponse.settings.memory_allocation,
                computeAllocation: rawResponse.settings.compute_allocation             
            },
            moduleHash: rawResponse.module_hash.length 
                ? convert.arrayOfNumberToArrayBuffer(rawResponse.module_hash[0]) 
                : null
        };
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