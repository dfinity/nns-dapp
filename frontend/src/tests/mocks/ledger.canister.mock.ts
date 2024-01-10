import {
  LedgerCanister,
  type AccountIdentifier,
  type BlockHeight,
} from "@dfinity/ledger-icp";

// eslint-disable-next-line
// @ts-ignore: test file
export class MockLedgerCanister extends LedgerCanister {
  constructor() {
    super();
  }

  create() {
    return this;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public accountBalance = async (_: {
    accountIdentifier: AccountIdentifier;
    certified?: boolean | undefined;
  }): Promise<bigint> => {
    return 1n;
  };

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public transfer = async (_: {
    to: AccountIdentifier;
    amount: bigint;
    memo?: bigint | undefined;
    fee?: bigint | undefined;
    fromSubAccount?: number[] | undefined;
  }): Promise<BlockHeight> => {
    return 0n;
  };
}
