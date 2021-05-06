import { Principal } from "@dfinity/agent";
import { Option } from "../option";
import { CanisterId } from "../common/types";
import { HttpError } from "../httpError";

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

export type CanisterDetailsResponse =
    CanisterDetailsSuccess |
    UserNotTheController;

export type UserNotTheController = {
    kind: "userNotTheController"
}

export type CanisterDetailsSuccess = {
    kind: "success",
    details: CanisterDetails
}

export interface CanisterDetails {
    status: CanisterStatus,
    memorySize: bigint,
    cycles: bigint,
    setting: CanisterSettings,
    moduleHash: Option<ArrayBuffer>
}

export type UpdateSettingsResponse =
    UpdateSettingSuccess |
    UserNotTheController;

export type UpdateSettingSuccess = {
    kind: "success"
}
    
export default interface ServiceInterface {
    getCanisterDetails: (canisterId: CanisterId) => Promise<CanisterDetailsResponse>,
    updateSettings: (request: UpdateSettingsRequest) => Promise<UpdateSettingsResponse>
};
