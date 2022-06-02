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
      throw new AccountNotFoundError("Account not found");
    }

    if (Ok) {
      return Ok;
    }

    // We should never reach here. Some of the previous properties should be present.
    throw new Error("Error getting account details");
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
      throw new AccountNotFoundError("Error creating subAccount");
    }

    if (NameTooLong === null) {
      // Which is the character?
      throw new NameTooLongError(`Error, name "${subAccountName}" is too long`);
    }

    if (SubAccountLimitExceeded === null) {
      // Which is the limit of subaccounts?
      throw new SubAccountLimitExceededError(
        `Error, subAccount limit exceeded`
      );
    }

    if (Ok) {
      return Ok;
    }

    // We should never reach here. Some of the previous properties should be present.
    throw new Error("Error creating subaccount");
  }

  public async registerHardwareWallet(
    request: RegisterHardwareWalletRequest
  ): Promise<void> {
    const response: RegisterHardwareWalletResponse =
      await this.certifiedService.register_hardware_wallet(request);

    if ("AccountNotFound" in response && response.AccountNotFound === null) {
      throw new AccountNotFoundError("Error registering hardware wallet");
    }

    if ("NameTooLong" in response && response.NameTooLong === null) {
      throw new NameTooLongError(`Error, name "${request.name}" is too long`);
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
        `Error renaming subAccount, account (${request.account_identifier}) not found`
      );
    }

    if (
      "SubAccountNotFound" in response &&
      response.SubAccountNotFound === null
    ) {
      throw new AccountNotFoundError(
        `Error renaming subAccount, subAccount (${request.account_identifier}) not found`
      );
    }

    if ("NameTooLong" in response && response.NameTooLong === null) {
      throw new NameTooLongError(
        `Error, name "${request.new_name}" is too long`
      );
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

  public detachCanister = async (canisterId: Principal): Promise<void> => {
    const response = await this.certifiedService.detach_canister({
      canister_id: canisterId,
    });
    if ("Ok" in response) {
      return;
    }
    // TODO: Throw proper errors https://dfinity.atlassian.net/browse/L2-615
    throw new Error(`Error detaching canister ${JSON.stringify(response)}`);
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
