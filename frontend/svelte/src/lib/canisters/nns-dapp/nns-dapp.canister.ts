import { Actor } from "@dfinity/agent";
import { AccountIdentifier } from "@dfinity/nns";
import { idlFactory as certifiedIdlFactory } from "./nns-dapp.certified.idl";
import {
  AccountNotFoundError,
  NameTooLongError,
  SubAccountLimitExceededError,
} from "./nns-dapp.errors";
import { idlFactory, NNSDappService } from "./nns-dapp.idl";
import type {
  AccountDetails,
  CanisterDetails,
  CreateSubAccountResponse,
  SubAccountDetails,
} from "./nns-dapp.types";
import type { NNSDappCanisterOptions } from "./types";

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
  public addAccount = async (): Promise<AccountIdentifier> => {
    const identifierText = await this.certifiedService.add_account();
    return AccountIdentifier.fromHex(identifierText);
  };

  /**
   * Get Account Details
   *
   * @returns Promise<void>
   */
  public getAccount = async (): Promise<AccountDetails> => {
    const { AccountNotFound, Ok } = await this.certifiedService.get_account();
    if (AccountNotFound === null) {
      throw new AccountNotFoundError("Error creating subAccount");
    }

    if (Ok) {
      return Ok;
    }

    // We should never reach here. Some of the previous properties should be present.
    throw new Error("Error getting account details");
  };

  /**
   * Creates a subaccount with the name and returns the Subaccount details
   *
   * TODO: Why is calling to `add_account` needed?
   */
  public createSubAccount = async ({
    subAccountName,
  }: {
    subAccountName: string;
  }): Promise<SubAccountDetails> => {
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
      throw new NameTooLongError(`Error, name ${subAccountName} is too long`);
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
  };

  public getCanisters = async ({
    certified,
  }: {
    certified: boolean;
  }): Promise<CanisterDetails[]> => {
    return this.serviceCaller(certified).get_canisters();
  };

  private serviceCaller(certified = true): NNSDappService {
    if (certified) {
      return this.certifiedService;
    }

    return this.service;
  }
}
