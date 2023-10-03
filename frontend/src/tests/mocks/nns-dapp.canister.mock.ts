import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import type {
  AccountDetails,
  RegisterHardwareWalletRequest,
  SubAccountDetails,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import {
  mockAccountDetails,
  mockMainAccount,
  mockSubAccountDetails,
} from "./icp-accounts.store.mock";

// eslint-disable-next-line
// @ts-ignore: test file
export class MockNNSDappCanister extends NNSDappCanister {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - we do not use the service for mocking purpose
    super(undefined, undefined);
  }

  create() {
    return this;
  }

  public async addAccount(): Promise<AccountIdentifier> {
    return AccountIdentifier.fromHex(mockMainAccount.identifier);
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public async getAccount(_: { certified: boolean }): Promise<AccountDetails> {
    return mockAccountDetails;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public async createSubAccount(_: {
    subAccountName: string;
  }): Promise<SubAccountDetails> {
    return mockSubAccountDetails;
  }

  public async registerHardwareWallet(
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    request: RegisterHardwareWalletRequest
  ): Promise<void> {
    // Do nothing
  }
}
