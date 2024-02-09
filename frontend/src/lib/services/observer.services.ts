import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import type { PostMessageDataResponseTransaction } from "$lib/types/post-message.transactions";
import type { Principal } from "@dfinity/principal";
import { jsonReviver } from "@dfinity/utils";

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
