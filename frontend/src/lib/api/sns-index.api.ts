import type {
  GetTransactionsParams,
  GetTransactionsResponse,
} from "$lib/api/icrc-index.api";
import { getTransactions as getIcrcTransactions } from "$lib/api/icrc-index.api";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Principal } from "@dfinity/principal";
import { wrapper } from "./sns-wrapper.api";

interface GetSnsTransactionsParams
  extends Omit<GetTransactionsParams, "getTransactions"> {
  rootCanisterId: Principal;
}

export const getSnsTransactions = async ({
  identity,
  rootCanisterId,
  ...rest
}: GetSnsTransactionsParams): Promise<GetTransactionsResponse> => {
  logWithTimestamp("Getting sns accounts transactions: call...");

  const { getTransactions } = await wrapper({
    identity,
    certified: true,
    rootCanisterId: rootCanisterId.toText(),
  });

  const results = await getIcrcTransactions({
    identity,
    ...rest,
    getTransactions,
  });

  logWithTimestamp("Getting sns account transactions: done");

  return results;
};
