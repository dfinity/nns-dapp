import { UnsupportedValueError } from "../../utils";
import * as convert from "../converter";
import {
  AttachCanisterResult,
  CanisterDetails,
  CreateSubAccountResponse,
  DetachCanisterResponse,
  GetAccountResponse,
  GetTransactionsResponse,
  HardwareWalletAccountDetails,
  KnownNeuron,
  MultiPartTransactionStatus,
  RegisterHardwareWalletResponse,
  RenameSubAccountResponse,
  SubAccountDetails,
} from "./model";
import {
  AttachCanisterResponse as RawAttachCanisterResponse,
  CanisterDetails as RawCanisterDetails,
  CreateSubAccountResponse as RawCreateSubAccountResponse,
  DetachCanisterResponse as RawDetachCanisterResponse,
  GetAccountResponse as RawGetAccountResponse,
  GetTransactionsResponse as RawGetTransactionsResponse,
  HardwareWalletAccountDetails as RawHardwareWalletAccountDetails,
  KnownNeuron as RawKnownNeuron,
  MultiPartTransactionStatus as RawMultiPartTransactionStatus,
  RegisterHardwareWalletResponse as RawRegisterHardwareWalletResponse,
  RenameSubAccountResponse as RawRenameSubAccountResponse,
  SubAccountDetails as RawSubAccountDetails,
} from "./rawService";
import TransactionsConverter from "./TransactionsConverter";

export default class ResponseConverters {
  public toAttachCanisterResponse = (
    response: RawAttachCanisterResponse
  ): AttachCanisterResult => {
    if ("Ok" in response) {
      return AttachCanisterResult.Ok;
    } else if ("CanisterAlreadyAttached" in response) {
      return AttachCanisterResult.CanisterAlreadyAttached;
    } else if ("NameAlreadyTaken" in response) {
      return AttachCanisterResult.NameAlreadyTaken;
    } else if ("NameTooLong" in response) {
      return AttachCanisterResult.NameTooLong;
    } else if ("CanisterLimitExceeded" in response) {
      return AttachCanisterResult.CanisterLimitExceeded;
    }
    // Check at compile-time that all cases are covered.
    throw new UnsupportedValueError(response);
  };

  public toDetachCanisterResponse = (
    response: RawDetachCanisterResponse
  ): DetachCanisterResponse => {
    return response;
  };

  public toArrayOfCanisterDetail = (
    response: Array<RawCanisterDetails>
  ): Array<CanisterDetails> => {
    return response.map(this.toCanisterDetails);
  };

  public toGetAccountResponse = (
    response: RawGetAccountResponse
  ): GetAccountResponse => {
    if ("Ok" in response) {
      return {
        Ok: {
          principal: response.Ok.principal.toString(),
          accountIdentifier: response.Ok.account_identifier,
          subAccounts: response.Ok.sub_accounts.map(this.toSubAccountDetails),
          hardwareWalletAccounts: response.Ok.hardware_wallet_accounts.map(
            this.toHardwareWalletAccountDetails
          ),
        },
      };
    }
    return response;
  };

  public toCreateSubAccountResponse = (
    response: RawCreateSubAccountResponse
  ): CreateSubAccountResponse => {
    if ("Ok" in response) {
      return {
        Ok: this.toSubAccountDetails(response.Ok),
      };
    }
    return response;
  };

  public toGetTransactionsResponse = (
    response: RawGetTransactionsResponse
  ): GetTransactionsResponse => {
    return {
      total: response.total,
      transactions: TransactionsConverter.convert(response.transactions),
    };
  };

  public toMultiPartTransactionStatus = (
    response: RawMultiPartTransactionStatus
  ): MultiPartTransactionStatus => {
    return response;
  };

  public toRegisterHardwareWalletResponse = (
    response: RawRegisterHardwareWalletResponse
  ): RegisterHardwareWalletResponse => {
    return response;
  };

  public toRenameSubAccountResponse = (
    response: RawRenameSubAccountResponse
  ): RenameSubAccountResponse => {
    return response;
  };

  public toKnownNeuron = (
      response: RawKnownNeuron
  ): KnownNeuron => {
    return {
      id: response.id,
      name: response.name,
      description: response.description[0] ?? ""
    };
  };

  private toSubAccountDetails = (
    subAccount: RawSubAccountDetails
  ): SubAccountDetails => {
    return {
      id: convert.toSubAccountId(subAccount.sub_account),
      accountIdentifier: subAccount.account_identifier,
      name: subAccount.name,
    };
  };

  private toCanisterDetails = (
    details: RawCanisterDetails
  ): CanisterDetails => {
    return {
      name:
        details.name.length > 0 ? details.name : details.canister_id.toString(),
      canisterId: details.canister_id.toString(),
    };
  };

  private toHardwareWalletAccountDetails = (
    hardwareWalletAccount: RawHardwareWalletAccountDetails
  ): HardwareWalletAccountDetails => {
    return {
      name: hardwareWalletAccount.name,
      principal: hardwareWalletAccount.principal.toString(),
      accountIdentifier: hardwareWalletAccount.account_identifier,
    };
  };
}
