import { Option } from "../option";
import { CanisterIdString } from "../common/types";

export interface CanisterSettings {
    controllers: string[],
    freezingThreshold: bigint,
    memoryAllocation: bigint,
    computeAllocation: bigint
}

export interface UpdateSettingsRequest {
    canisterId: CanisterIdString,
    settings: {
        controllers?: Array<string>,
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
    getCanisterDetails: (canisterId: CanisterIdString) => Promise<CanisterDetailsResponse>,
    updateSettings: (request: UpdateSettingsRequest) => Promise<UpdateSettingsResponse>
}
