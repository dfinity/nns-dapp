import { AccountIdentifier } from "@dfinity/nns";
import { NNSDappCanister } from "../../lib/canisters/nns-dapp/nns-dapp.canister";
import type {
  AccountDetails,
  SubAccountDetails,
} from "../../lib/canisters/nns-dapp/nns-dapp.types";
import {
  mockAccountDetails,
  mockMainAccount,
  mockSubAccountDetails,
} from "./accounts.store.mock";

// eslint-disable-next-line
// @ts-ignore: test file
export class MockNNSDappCanister extends NNSDappCanister {
  constructor() {
    // @ts-ignore - we do not use the service for mocking purpose
    super(undefined, undefined);
  }

  create() {
    return this;
  }

  public addAccount = async (): Promise<AccountIdentifier> => {
    return AccountIdentifier.fromHex(mockMainAccount.identifier);
  };

  public getAccount = async ({
    certified,
  }: {
    certified: boolean;
  }): Promise<AccountDetails> => {
    return mockAccountDetails;
  };

  public createSubAccount = async ({
    subAccountName,
  }: {
    subAccountName: string;
  }): Promise<SubAccountDetails> => {
    return mockSubAccountDetails;
  };
}
