import type { IcrcTransactionWithId } from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";

export interface IcrcCandidAccount {
  owner: Principal;
  subaccount: [] | [Uint8Array];
}

export const createIcrcTransactionWithId = (
  to: IcrcCandidAccount,
  from: IcrcCandidAccount
): IcrcTransactionWithId => ({
  id: BigInt(123),
  transaction: {
    kind: "transfer",
    timestamp: BigInt(12354),
    burn: [],
    mint: [],
    transfer: [
      {
        to,
        from,
        memo: [],
        created_at_time: [BigInt(123)],
        amount: BigInt(33),
        fee: [BigInt(1)],
      },
    ],
  },
});
