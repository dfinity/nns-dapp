import { Principal } from "@dfinity/agent";
import { Option } from "../option";
import { CanisterId } from "../common/types";

export interface CanisterSettings {
    controller: Principal,
    freezingThreshold: bigint,
    memoryAllocation: bigint,
    computeAllocation: bigint
}

export interface UpdateSettingsRequest {
    canisterId: CanisterId,
    settings: {
        controller?: Principal,
        freezingThreshold?: bigint,
        memoryAllocation?: bigint,
        computeAllocation?: bigint
    }
}

export enum CanisterStatus {
    Stopped,
    Stopping,
    Running
}

export interface CanisterStatusResponse {
    status: CanisterStatus,
    memorySize: bigint,
    cycles: bigint,
    setting: CanisterSettings,
    moduleHash: Option<ArrayBuffer>
}

export default interface ServiceInterface {
    getCanisterStatus: (canisterId: CanisterId) => Promise<CanisterStatusResponse>,
    updateSettings: (request: UpdateSettingsRequest) => Promise<void>
};
