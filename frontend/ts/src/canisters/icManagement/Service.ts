import { Principal } from "@dfinity/principal";
import RawService, { definite_canister_settings } from "./rawService";
import ServiceInterface, { CanisterStatus, CanisterDetailsResponse, UpdateSettingsRequest, UpdateSettingsResponse } from "./model";
import { CanisterIdString } from "../common/types";
import * as convert from "../converter";
import { toHttpError } from "../httpError";

interface CanisterStatusResponse {
    'status' : { 'stopped' : null } |
        { 'stopping' : null } |
        { 'running' : null },
    'memory_size' : bigint,
    'cycles' : bigint,
    'settings' : definite_canister_settings,
    'module_hash' : [] | [Array<number>],
};

export default class Service implements ServiceInterface {
    private readonly service: RawService;

    public constructor(service: RawService) {
        this.service = service;
    }

    public getCanisterDetails = async (canisterId: CanisterIdString) : Promise<CanisterDetailsResponse> => {
        let rawResponse: CanisterStatusResponse;
        try {
            rawResponse = await this.service.canister_status({ canister_id: Principal.fromText(canisterId) });
        } catch (e) {
            const httpError = toHttpError(e);
            if (httpError.code === 403) {
                return { kind: "userNotTheController" }
            } else {
                throw e;
            }
        }

        let status: CanisterStatus;
        if ("stopped" in rawResponse.status) {
            status = CanisterStatus.Stopped;
        } else if ("stopping" in rawResponse.status) {
            status = CanisterStatus.Stopping;        
        } else if ("running" in rawResponse.status) {
            status = CanisterStatus.Running;        
        }
        const result: CanisterDetailsResponse = { 
            kind: "success", 
            details: {
                status: status,
                memorySize: rawResponse.memory_size,
                cycles: rawResponse.cycles,
                setting: {
                    controllers: rawResponse.settings.controllers.map(principal => principal.toText()),
                    freezingThreshold: rawResponse.settings.freezing_threshold,
                    memoryAllocation: rawResponse.settings.memory_allocation,
                    computeAllocation: rawResponse.settings.compute_allocation
                },
                moduleHash: rawResponse.module_hash.length 
                    ? convert.arrayOfNumberToArrayBuffer(rawResponse.module_hash[0]) 
                    : null
            }
        };    

        return result;
}

    public updateSettings = async (request: UpdateSettingsRequest) : Promise<UpdateSettingsResponse> => {
        const settings = request.settings;
        try {
            await this.service.update_settings({
                canister_id: Principal.fromText(request.canisterId),
                settings: {
                    controllers: settings.controllers ? [settings.controllers.map(c => Principal.fromText(c))] : [],
                    freezing_threshold: settings.freezingThreshold ? [settings.freezingThreshold] : [],
                    memory_allocation: settings.memoryAllocation ? [settings.memoryAllocation] : [],
                    compute_allocation: settings.computeAllocation ? [settings.computeAllocation] : [],
                }
            });
            return { kind: "success" };
        } catch (e) {
            const httpError = toHttpError(e);
            if (httpError.code === 403) {
                return { kind: "userNotTheController" }
            } else {
                throw e;
            }
        }
    }
}