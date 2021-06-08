import { Principal } from "@dfinity/principal";
import {
    AttachCanisterRequest,
    DetachCanisterRequest,
    GetStakeNeuronStatusRequest,
    GetTransactionsRequest,
    RegisterHardwareWalletRequest,
    RemoveHardwareWalletRequest,
    RenameSubAccountRequest
} from "./model";
import {
    AttachCanisterRequest as RawAttachCanisterRequest,
    DetachCanisterRequest as RawDetachCanisterRequest,
    GetStakeNeuronStatusRequest as RawGetStakeNeuronStatusRequest,
    GetTransactionsRequest as RawGetTransactionsRequest,
    RegisterHardwareWalletRequest as RawRegisterHardwareWalletRequest,
    RemoveHardwareWalletRequest as RawRemoveHardwareWalletRequest,
    RenameSubAccountRequest as RawRenameSubAccountRequest
} from "./rawService";

export default class RequestConverters {

    public fromAttachCanisterRequest = (request: AttachCanisterRequest) : RawAttachCanisterRequest => {
        return {
            name: request.name,
            canister_id: Principal.fromText(request.canisterId)
        };
    }

    public fromDetachCanisterRequest = (request: DetachCanisterRequest) : RawDetachCanisterRequest => {
        return {
            canister_id: Principal.fromText(request.canisterId)
        };
    }

    public fromGetStakeNeuronStatusRequest = (request: GetStakeNeuronStatusRequest) : RawGetStakeNeuronStatusRequest => {
        return {
            block_height: request.blockHeight,
            memo: request.memo
        };
    }

    public fromGetTransactionsRequest = (request: GetTransactionsRequest) : RawGetTransactionsRequest => {
        return {
            account_identifier: request.accountIdentifier,
            offset: request.offset,
            page_size: request.pageSize
        };
    }

    public fromRegisterHardwareWalletRequest = (request: RegisterHardwareWalletRequest) : RawRegisterHardwareWalletRequest => {
        return {
            name: request.name,
            principal: Principal.fromText(request.principal)
        };
    }

    public fromRemoveHardwareWalletRequest = (request: RemoveHardwareWalletRequest) : RawRemoveHardwareWalletRequest => {
        return {
            principal: Principal.fromText(request.principal)
        };
    }

    public fromRenameSubAccountRequest = (request: RenameSubAccountRequest) : RawRenameSubAccountRequest => {
        return {
            account_identifier: request.accountIdentifier,
            new_name: request.newName
        }
    }
}
