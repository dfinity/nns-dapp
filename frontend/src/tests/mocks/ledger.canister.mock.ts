import type { AccountIdentifier, BlockHeight } from "@dfinity/nns";
import { ICP, LedgerCanister } from "@dfinity/nns";

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
  }): Promise<ICP> => {
    return ICP.fromE8s(BigInt(1));
  };

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public transfer = async (_: {
    to: AccountIdentifier;
    amount: ICP;
    memo?: bigint | undefined;
    fee?: bigint | undefined;
    fromSubAccount?: number[] | undefined;
  }): Promise<BlockHeight> => {
    return BigInt(0);
  };
}
