import { GetTransactionsRequest, RegisterHardwareWalletRequest } from "./model";
import {
    GetTransactionsRequest as RawGetTransactionsRequest,
    RegisterHardwareWalletRequest as RawRegisterHardwareWalletRequest
} from "./rawService";

export default class RequestConverters {
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
}
