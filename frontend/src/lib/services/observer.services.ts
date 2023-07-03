import { icrcTransactionsStore } from "$lib/stores/icrc-transactions.store";
import type { PostMessageDataResponseTransaction } from "$lib/types/post-message.transactions";
import type { UniverseCanisterId } from "$lib/types/universe";
import { jsonReviver } from "$lib/utils/json.utils";

export const addObservedIcrcTransactionsToStore = ({
  universeId,
  completed,
  transactions,
}: {
  universeId: UniverseCanisterId;
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
      canisterId: universeId,
      completed,
    });
  }
};
