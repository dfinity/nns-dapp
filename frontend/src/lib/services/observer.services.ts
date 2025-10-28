import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import type { PostMessageDataResponseTransaction } from "$lib/types/post-message.transactions";
import { jsonReviver } from "@dfinity/utils";
import type { Principal } from "@icp-sdk/core/principal";

export const addObservedIcrcTransactionsToStore = ({
  ledgerCanisterId,
  completed,
  transactions,
}: {
  ledgerCanisterId: Principal;
  completed: boolean;
  transactions: PostMessageDataResponseTransaction[];
}) => {
  for (const transaction of transactions) {
    const {
      transactions: jsonTransactions,
      mostRecentTxId: _,
      accountIdentifier,
      ...rest
    } = transaction;

    icrcTransactionsStore.addTransactions({
      ...rest,
      accountIdentifier,
      transactions: JSON.parse(jsonTransactions, jsonReviver),
      canisterId: ledgerCanisterId,
      completed,
    });
  }
};
