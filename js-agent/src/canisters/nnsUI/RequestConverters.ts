import { Principal } from "@dfinity/agent";
import {
    AttachCanisterRequest,
    DetachCanisterRequest,
    GetTransactionsRequest,
    RegisterHardwareWalletRequest,
    RemoveHardwareWalletRequest,
    RenameSubAccountRequest
} from "./model";
import {
    AttachCanisterRequest as RawAttachCanisterRequest,
    DetachCanisterRequest as RawDetachCanisterRequest,
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
            account_identifier: request.accountIdentifier
        };
    }

    public fromRemoveHardwareWalletRequest = (request: RemoveHardwareWalletRequest) : RawRemoveHardwareWalletRequest => {
        return {
            account_identifier: request.accountIdentifier
        };
    }

    public fromRenameSubAccountRequest = (request: RenameSubAccountRequest) : RawRenameSubAccountRequest => {
        return {
            account_identifier: request.accountIdentifier,
            new_name: request.newName
        }
    }
}
