import type { PostMessageDataRequestBalances } from "$lib/types/post-message.balances";
import { getIcrcBalance } from "$lib/worker-api/icrc-ledger.worker-api";
import type { DictionaryWorkerData } from "$lib/worker-stores/dictionary.worker-store";
import type { TimerWorkerUtilsJobData } from "$lib/worker-utils/timer.worker-utils";
import { decodeIcrcAccount } from "@dfinity/ledger";

export interface GetAccountsBalanceData extends DictionaryWorkerData {
  balance: bigint;
}

export const getIcrcAccountsBalances = ({
  identity,
  data: { accountIdentifiers, ledgerCanisterId, ...rest },
  certified,
}: TimerWorkerUtilsJobData<PostMessageDataRequestBalances> & {
  certified: boolean;
}): Promise<GetAccountsBalanceData[]> =>
  Promise.all(
    accountIdentifiers.map(async (accountIdentifier) => {
      const balance = await getIcrcBalance({
        ledgerCanisterId,
        identity,
        account: decodeIcrcAccount(accountIdentifier),
        certified,
        ...rest,
      });

      return {
        balance,
        key: accountIdentifier,
        certified,
      };
    })
  );
