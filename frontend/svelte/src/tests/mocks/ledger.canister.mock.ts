import { AccountIdentifier, ICP, LedgerCanister } from "@dfinity/nns";

// @ts-ignore
export class MockLedgerCanister extends LedgerCanister {
  constructor() {
    super();
  }

  create() {
    return this;
  }

  accountBalance = async ({
    accountIdentifier,
    certified = true,
  }: {
    accountIdentifier: AccountIdentifier;
    certified?: boolean;
  }): Promise<ICP> => Promise.resolve(ICP.fromString("1") as ICP);
}
