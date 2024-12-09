import { getTransactions } from "$lib/api/icp-index.api";
import type { Account } from "$lib/types/account";
import { neuronStake } from "$lib/utils/neuron.utils";
import { SignIdentity } from "@dfinity/agent";
import type { TransactionWithId } from "@dfinity/ledger-icp";
import type { NeuronInfo } from "@dfinity/nns";
import { isNullish } from "@dfinity/utils";

type TransactionEntity =
  | {
      identifier: string;
      balance: bigint;
      type: "account";
      originalData: Account;
    }
  | {
      identifier: string;
      balance: bigint;
      type: "neuron";
      originalData: NeuronInfo;
    };

const accountToTransactionEntity = (account: Account): TransactionEntity => {
  return {
    identifier: account.identifier,
    type: "account",
    balance: account.balanceUlps,
    originalData: account,
  };
};
const neuronToTransactionEntity = (neuron: NeuronInfo): TransactionEntity => {
  return {
    identifier: neuron.fullNeuron?.accountIdentifier || "",
    balance: neuronStake(neuron),
    type: "neuron",
    originalData: neuron,
  };
};
export const mapAccountOrNeuronToTransactionEntity = (
  entity: Account | NeuronInfo
): TransactionEntity => {
  if ("neuronId" in entity) {
    return neuronToTransactionEntity(entity);
  }
  return accountToTransactionEntity(entity);
};

export type TransactionResults = {
  entity: TransactionEntity;
  transactions: TransactionWithId[];
  error?: string;
}[];

export const getAccountTransactionsConcurrently = async ({
  entities,
  identity,
}: {
  entities: (Account | NeuronInfo)[];
  identity: SignIdentity;
}): Promise<TransactionResults> => {
  const transactionEntities = entities.map(
    mapAccountOrNeuronToTransactionEntity
  );

  const transactionPromises = transactionEntities.map((entity) =>
    getAllTransactionsFromAccountAndIdentity({
      accountId: entity.identifier,
      identity,
    })
  );

  const results = await Promise.allSettled(transactionPromises);

  const entitiesAndTransactions = results.map((result, index) => {
    const entity = transactionEntities[index];
    const baseInfo = {
      entity,
    };

    if (result.status === "fulfilled") {
      return {
        ...baseInfo,
        transactions: result.value ?? [],
      };
    } else {
      return {
        ...baseInfo,
        transactions: [],
        error: result.reason?.message || "Failed to fetch transactions",
      };
    }
  });

  return entitiesAndTransactions;
};

export const getAllTransactionsFromAccountAndIdentity = async ({
  accountId,
  identity,
  lastTransactionId = undefined,
  allTransactions = [],
  currentPageIndex = 1,
}: {
  accountId: string;
  identity: SignIdentity;
  lastTransactionId?: bigint;
  allTransactions?: TransactionWithId[];
  currentPageIndex?: number;
}): Promise<TransactionWithId[] | undefined> => {
  // Based on
  //   https://github.com/dfinity/ic/blob/master/rs/ledger_suite/icp/index/src/lib.rs#L31
  //   https://github.com/dfinity/ic/blob/master/rs/ledger_suite/icp/index/src/main.rs#L593
  //   https://github.com/dfinity/ic/blob/master/rs/ledger_suite/icp/src/lib.rs#L1237
  //   https://github.com/dfinity/ic/blob/master/rs/ledger_suite/icp/src/lib.rs#L45
  const pageSize = 2000n;
  const maxNumberOfPages = 10;

  try {
    // TODO: Decide what to do if we reach the maximum number of iterations.
    if (currentPageIndex > maxNumberOfPages) {
      console.warn(
        `Reached maximum limit of iterations(${maxNumberOfPages}). Stopping.`
      );
      return allTransactions;
    }

    const { transactions, oldestTxId } = await getTransactions({
      accountIdentifier: accountId,
      identity,
      maxResults: pageSize,
      start: lastTransactionId,
    });

    const updatedTransactions = [...allTransactions, ...transactions];

    // We consider it complete if we find the oldestTxId in the list of transactions or if oldestTxId is null.
    // The latter condition is necessary if the list of transactions is empty, which would otherwise return false.
    const completed =
      isNullish(oldestTxId) || transactions.some(({ id }) => id === oldestTxId);

    if (!completed) {
      const lastTx = transactions[transactions.length - 1];
      return getAllTransactionsFromAccountAndIdentity({
        accountId,
        identity,
        lastTransactionId: lastTx.id,
        allTransactions: updatedTransactions,
        currentPageIndex: currentPageIndex + 1,
      });
    }

    return updatedTransactions;
  } catch (error) {
    console.error("Error loading ICP account transactions:", error);
    return allTransactions;
  }
};
