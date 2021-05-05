import { Principal } from "@dfinity/agent";
import { CanisterId } from "../ledger/createCanister";

export interface CanisterSettings {
    controller?: Principal,
    freezingThreshold?: bigint,
    memoryAllocation?: bigint,
    computeAllocation?: bigint
}

export interface UpdateSettingsRequest {
    canisterId: CanisterId,
    settings: CanisterSettings
}

export default interface ServiceInterface {
    updateSettings: (request: UpdateSettingsRequest) => Promise<void>
};
