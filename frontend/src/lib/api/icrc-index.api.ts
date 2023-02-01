import type { Identity } from "@dfinity/agent";
import type {
  GetAccountTransactionsParams,
  IcrcAccount,
  IcrcGetTransactions,
} from "@dfinity/ledger";
import type { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";

export interface GetTransactionsParams {
  identity: Identity;
  account: IcrcAccount;
  start?: bigint;
  maxResults: bigint;
  canisterId: Principal;
  getTransactions: (
    params: GetAccountTransactionsParams
  ) => Promise<IcrcGetTransactions>;
}

export interface GetTransactionsResponse
  extends Omit<IcrcGetTransactions, "oldest_tx_id"> {
  oldestTxId?: bigint;
}

export const getTransactions = async ({
  maxResults: max_results,
  start,
  account,
  getTransactions: getTransactionsApi,
}: Omit<
  GetTransactionsParams,
  "canisterId"
>): Promise<GetTransactionsResponse> => {
  const { oldest_tx_id, ...rest } = await getTransactionsApi({
    max_results,
    start,
    account,
  });

  return {
    oldestTxId: fromNullable(oldest_tx_id),
    ...rest,
  };
};
