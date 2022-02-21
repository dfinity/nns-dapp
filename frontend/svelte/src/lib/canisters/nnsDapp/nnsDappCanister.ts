import { Actor } from "@dfinity/agent";
import { AccountIdentifier } from "@dfinity/nns";
import { idlFactory as certifiedIdlFactory } from "./nns_dapp.certified.idl";
import { idlFactory, NNSDappService } from "./nns_dapp.idl";
import type {
  CreateSubAccountResponse,
  SubAccountDetails,
} from "./nns_dappTypes";
import type { NNSDappCanisterOptions } from "./types";

export class NNSDappCanister {
  private constructor(
    private readonly service: NNSDappService,
    private readonly certifiedService: NNSDappService
  ) {
    this.service = service;
    this.certifiedService = certifiedService;
  }

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
   * Used to be able to create subAccounts
   *
   * TODO: Understand why we need this?
   * TODO: Remove if not needed?
   *
   * @returns Promise<void>
   */
  public addAccount = async (): Promise<AccountIdentifier> => {
    const identifierText = await this.certifiedService.add_account();
    return AccountIdentifier.fromHex(identifierText);
  };

  /**
   * Creates a subaccount with the name and returns the Subaccount details
   *
   * TODO: Does this belong here in the "LedgerCanister"
   * TODO: Error messages
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
      throw new Error("Error creating subAccount");
    }

    if (NameTooLong === null) {
      // Which is the character?
      throw new Error(`Error, name ${subAccountName} is too long`);
    }

    if (SubAccountLimitExceeded === null) {
      // Which is the limit of subaccounts?
      throw new Error(`Error, name ${subAccountName} is too long`);
    }

    if (Ok) {
      return Ok;
    }

    // We should never reach here. Some of the previous properties should be present.
    throw new Error("Error creating subaccount");
  };
}
