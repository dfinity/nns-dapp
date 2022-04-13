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

  public accountBalance = async ({
    accountIdentifier,
    certified,
  }: {
    accountIdentifier: AccountIdentifier;
    certified?: boolean | undefined;
  }): Promise<ICP> => {
    return ICP.fromE8s(BigInt(1));
  };

  public transfer = async ({
    to,
    amount,
    memo,
    fee,
    fromSubAccountId,
  }: {
    to: AccountIdentifier;
    amount: ICP;
    memo?: bigint | undefined;
    fee?: bigint | undefined;
    fromSubAccountId?: number | undefined;
  }): Promise<BlockHeight> => {
    return BigInt(0);
  };
}
