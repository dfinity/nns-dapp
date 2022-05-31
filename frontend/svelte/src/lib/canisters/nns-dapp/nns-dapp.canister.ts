import { Actor } from "@dfinity/agent";
import { AccountIdentifier } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { NNSDappCanisterOptions } from "./nns-dapp.canister.types";
import { idlFactory as certifiedIdlFactory } from "./nns-dapp.certified.idl";
import {
  AccountNotFoundError,
  HardwareWalletAttachError,
  NameTooLongError,
  SubAccountLimitExceededError,
} from "./nns-dapp.errors";
import type { NNSDappService } from "./nns-dapp.idl";
import { idlFactory } from "./nns-dapp.idl";
import type {
  AccountDetails,
  AccountIdentifierString,
  CanisterDetails,
  CreateSubAccountResponse,
  GetTransactionsResponse,
  RegisterHardwareWalletRequest,
  RegisterHardwareWalletResponse,
  RenameSubAccountRequest,
  RenameSubAccountResponse,
  SubAccountDetails,
} from "./nns-dapp.types";

export class NNSDappCanister {
  private constructor(
    private readonly service: NNSDappService,
    private readonly certifiedService: NNSDappService
  ) {
    this.service = service;
    this.certifiedService = certifiedService;
  }

  // TODO: Improve arguments https://dfinity.atlassian.net/browse/L2-299
  public static create(options: NNSDappCanisterOptions) {
    const agent = options.agent;
    const canisterId = options.canisterId;

    const service =
      options.serviceOverride ??
      Actor.createActor<NNSDappService>(idlFactory, {
        agent,
        canisterId,
      });

    const certifiedService =
      options.certifiedServiceOverride ??
      Actor.createActor<NNSDappService>(certifiedIdlFactory, {
        agent,
        canisterId,
      });

    return new NNSDappCanister(service, certifiedService);
  }

  /**
   * Add account to NNSDapp Canister if it doesn't exist.
   *
   * @returns Promise<void>
   */
  public async addAccount(): Promise<AccountIdentifier> {
    const identifierText = await this.certifiedService.add_account();
    return AccountIdentifier.fromHex(identifierText);
  }

  /**
   * Get Account Details
   *
   * @returns Promise<void>
   */
  public async getAccount({
    certified,
  }: {
    certified: boolean;
  }): Promise<AccountDetails> {
    const { AccountNotFound, Ok } = await this.getNNSDappService(
      certified
    ).get_account();
    if (AccountNotFound === null) {
      throw new AccountNotFoundError("error__account.not_found");
    }

    if (Ok) {
      return Ok;
    }

    // We should never reach here. Some of the previous properties should be present.
    throw new Error("error__account.no_details");
  }

  /**
   * Creates a subaccount with the name and returns the Subaccount details
   */
  public async createSubAccount({
    subAccountName,
  }: {
    subAccountName: string;
  }): Promise<SubAccountDetails> {
    const {
      AccountNotFound,
      NameTooLong,
      SubAccountLimitExceeded,
      Ok,
    }: CreateSubAccountResponse = await this.certifiedService.create_sub_account(
      subAccountName
    );

    if (AccountNotFound === null) {
      throw new AccountNotFoundError("error__account.create_subaccount");
    }

    if (NameTooLong === null) {
      throw new NameTooLongError("error__account.subaccount_too_long", {
        $subAccountName: subAccountName,
      });
    }

    if (SubAccountLimitExceeded === null) {
      // Which is the limit of subaccounts?
      throw new SubAccountLimitExceededError(
        "error__account.create_subaccount_limit_exceeded"
      );
    }

    if (Ok) {
      return Ok;
    }

    // We should never reach here. Some of the previous properties should be present.
    throw new Error("error__account.create_subaccount");
  }

  public async registerHardwareWallet(
    request: RegisterHardwareWalletRequest
  ): Promise<void> {
    const response: RegisterHardwareWalletResponse =
      await this.certifiedService.register_hardware_wallet(request);

    if ("AccountNotFound" in response && response.AccountNotFound === null) {
      throw new AccountNotFoundError(
        "error__attach_wallet.register_hardware_wallet"
      );
    }

    if ("NameTooLong" in response && response.NameTooLong === null) {
      throw new NameTooLongError(
        "error__attach_wallet.create_hardware_wallet_too_long",
        {
          $accountName: request.name,
        }
      );
    }

    if (
      "HardwareWalletAlreadyRegistered" in response &&
      response.HardwareWalletAlreadyRegistered === null
    ) {
      throw new HardwareWalletAttachError(
        "error__attach_wallet.already_registered"
      );
    }

    if (
      "HardwareWalletLimitExceeded" in response &&
      response.HardwareWalletLimitExceeded === null
    ) {
      throw new HardwareWalletAttachError(
        "error__attach_wallet.limit_exceeded"
      );
    }
  }

  public renameSubAccount = async (
    request: RenameSubAccountRequest
  ): Promise<void> => {
    const response: RenameSubAccountResponse =
      await this.certifiedService.rename_sub_account(request);

    if ("AccountNotFound" in response && response.AccountNotFound === null) {
      throw new AccountNotFoundError(
        "error__account.rename_account_not_found",
        {
          $account_identifier: request.account_identifier,
        }
      );
    }

    if (
      "SubAccountNotFound" in response &&
      response.SubAccountNotFound === null
    ) {
      throw new AccountNotFoundError("error__account.subaccount_not_found", {
        $account_identifier: request.account_identifier,
      });
    }

    if ("NameTooLong" in response && response.NameTooLong === null) {
      throw new NameTooLongError("error__account.subaccount_too_long", {
        $subAccountName: request.new_name,
      });
    }
  };

  public getCanisters = async ({
    certified,
  }: {
    certified: boolean;
  }): Promise<CanisterDetails[]> => {
    return this.getNNSDappService(certified).get_canisters();
  };

  private getNNSDappService(certified = true): NNSDappService {
    if (certified) {
      return this.certifiedService;
    }

    return this.service;
  }

  public attachCanister = async ({
    name,
    canisterId,
  }: {
    name: string;
    canisterId: Principal;
  }): Promise<void> => {
    const response = await this.certifiedService.attach_canister({
      name,
      canister_id: canisterId,
    });
    if ("Ok" in response) {
      return;
    }
    // TODO: Throw proper errors https://dfinity.atlassian.net/browse/L2-615
    throw new Error(`Error attaching canister ${JSON.stringify(response)}`);
  };

  public async getTransactions({
    accountIdentifier,
    pageSize,
    offset,
    certified,
  }: {
    accountIdentifier: AccountIdentifierString;
    pageSize: number;
    offset: number;
    certified: boolean;
  }): Promise<GetTransactionsResponse> {
    return this.getNNSDappService(certified).get_transactions({
      page_size: pageSize,
      offset,
      account_identifier: accountIdentifier,
    });
  }
}
