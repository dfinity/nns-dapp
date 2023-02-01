import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import { getTransactions as getIcrcTransactions } from "$lib/api/icrc-index.api";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import { wrapper } from "./sns-wrapper.api";

export type GetSnsTransactionsParams = Omit<
  GetTransactionsParams,
  "getTransactions"
>;

export const getSnsTransactions = async ({
  identity,
  canisterId,
  ...rest
}: GetSnsTransactionsParams): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Getting sns accounts transactions: call...");

  const { getTransactions } = await wrapper({
    identity,
    certified: true,
    rootCanisterId: canisterId.toText(),
  });

  const results = await getIcrcTransactions({
    identity,
    ...rest,
    getTransactions,
  });

  logWithTimestamp("Getting sns account transactions: done");

  return results;
};
