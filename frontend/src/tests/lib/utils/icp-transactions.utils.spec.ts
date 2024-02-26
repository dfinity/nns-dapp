import {
  CREATE_CANISTER_MEMO,
  TOP_UP_CANISTER_MEMO,
} from "$lib/constants/api.constants";
import { NANO_SECONDS_IN_MILLISECOND } from "$lib/constants/constants";
import type { UiTransaction } from "$lib/types/transaction";
import {
  mapIcpTransaction,
  mapToSelfTransactions,
  sortTransactionsById,
} from "$lib/utils/icp-transactions.utils";
import en from "$tests/mocks/i18n.mock";
import type { Operation, TransactionWithId } from "@dfinity/ledger-icp";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("icp-transactions.utils", () => {
  const defaultTimestamp = new Date("2023-01-01T00:00:00.000Z");
  const to = "12345";
  const from = "56789";
  const amount = 200_000_000n;
  const fee = 10_000n;
  const transactionId = 1234n;
  const createTransactionWithId = ({
    id = transactionId,
    memo,
    operation,
    timestamp = defaultTimestamp,
  }: {
    id?: bigint;
    operation: Operation;
    memo?: bigint;
    timestamp?: Date;
  }): TransactionWithId => ({
    id,
    transaction: {
      memo: memo ?? 0n,
      icrc1_memo: [],
      operation,
      created_at_time: [
        {
          timestamp_nanos:
            BigInt(timestamp.getTime()) * BigInt(NANO_SECONDS_IN_MILLISECOND),
        },
      ],
    },
  });
  const defaultTransferOperation: Operation = {
    Transfer: {
      to,
      fee: { e8s: fee },
      from,
      amount: { e8s: amount },
      spender: [],
    },
  };
  const defaultUiTransaction: UiTransaction = {
    domKey: `${transactionId}-1`,
    isIncoming: false,
    otherParty: to,
    tokenAmount: TokenAmountV2.fromUlps({
      amount: amount + fee,
      token: ICPToken,
    }),
    isReimbursement: false,
    isPending: false,
    isFailed: false,
    headline: "Sent",
    timestamp: defaultTimestamp,
  };
  const toSelfOperation: Operation = {
    Transfer: {
      to: from,
      fee: { e8s: fee },
      from,
      amount: { e8s: amount },
      spender: [],
    },
  };

  describe("mapIcpTransaction", () => {
    it("maps stake neuron transaction", () => {
      const transaction = createTransactionWithId({
        operation: defaultTransferOperation,
        memo: 12345n,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Staked",
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>([to]),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps top up neuron transaction", () => {
      const transaction = createTransactionWithId({
        operation: defaultTransferOperation,
        memo: 0n,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Top-up Neuron",
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>([to]),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps create canister transaction", () => {
      const transaction = createTransactionWithId({
        operation: defaultTransferOperation,
        memo: CREATE_CANISTER_MEMO,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Create Canister",
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps top up canister transaction", () => {
      const transaction = createTransactionWithId({
        operation: defaultTransferOperation,
        memo: TOP_UP_CANISTER_MEMO,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Top-up Canister",
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps swap participation transaction", () => {
      const transaction = createTransactionWithId({
        operation: defaultTransferOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Decentralization Swap",
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>([to]),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps swap participation refund transaction", () => {
      const transaction = createTransactionWithId({
        operation: defaultTransferOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Swap Refund",
        isIncoming: true,
        otherParty: from,
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: ICPToken,
        }),
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: to,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>([from]),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps sent transaction", () => {
      const transaction = createTransactionWithId({
        operation: defaultTransferOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Sent",
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps received transaction", () => {
      const transaction = createTransactionWithId({
        operation: defaultTransferOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        isIncoming: true,
        otherParty: from,
        headline: "Received",
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: ICPToken,
        }),
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: to,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps toSelf transaction as Received", () => {
      const transaction = createTransactionWithId({
        operation: toSelfOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Received",
        domKey: `${transactionId}-0`,
        otherParty: from,
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: ICPToken,
        }),
        isIncoming: true,
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: true,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps toSelf transaction as Sent", () => {
      const transaction = createTransactionWithId({
        operation: toSelfOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Sent",
        domKey: `${transactionId}-1`,
        otherParty: from,
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps approve transaction", () => {
      const transaction = createTransactionWithId({
        operation: {
          Approve: {
            fee: { e8s: fee },
            from,
            spender: to,
            expires_at: [],
            allowance: { e8s: amount },
            expected_allowance: [],
          },
        },
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Approve transfer",
        tokenAmount: TokenAmountV2.fromUlps({
          amount: fee,
          token: ICPToken,
        }),
        // TODO: Should the other party be the spender?
        // This is how we show it for ICRC transactions.
        otherParty: undefined,
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps Burn transaction", () => {
      const transaction = createTransactionWithId({
        operation: {
          Burn: {
            from,
            spender: [],
            amount: { e8s: amount },
          },
        },
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Sent",
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: ICPToken,
        }),
        otherParty: undefined,
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    it("maps Mint transaction", () => {
      const transaction = createTransactionWithId({
        operation: {
          Mint: {
            to: from,
            amount: { e8s: amount },
          },
        },
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Received",
        isIncoming: true,
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: ICPToken,
        }),
        otherParty: undefined,
      };

      expect(
        mapIcpTransaction({
          transaction,
          accountIdentifier: from,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });
  });

  describe("mapToSelfTransactions", () => {
    it("duplicateds toSelf transactions", () => {
      const transaction = createTransactionWithId({
        operation: toSelfOperation,
      });

      expect(mapToSelfTransactions([transaction])).toEqual([
        {
          transaction,
          toSelfTransaction: true,
        },
        {
          transaction,
          toSelfTransaction: false,
        },
      ]);
    });

    it("doesn't duplicate not to self transactoins", () => {
      const transaction = createTransactionWithId({
        operation: toSelfOperation,
      });
      const notToSelfTransaction = createTransactionWithId({
        operation: defaultTransferOperation,
      });

      expect(
        mapToSelfTransactions([transaction, notToSelfTransaction])
      ).toEqual([
        {
          transaction,
          toSelfTransaction: true,
        },
        {
          transaction,
          toSelfTransaction: false,
        },
        {
          transaction: notToSelfTransaction,
          toSelfTransaction: false,
        },
      ]);
    });
  });

  describe("sortTransactionsById", () => {
    const firstTransaction = createTransactionWithId({
      operation: defaultTransferOperation,
      id: 10n,
    });
    const secondTransaction = createTransactionWithId({
      operation: defaultTransferOperation,
      id: 20n,
    });
    const thirdTransaction = createTransactionWithId({
      operation: defaultTransferOperation,
      id: 30n,
    });
    it("sorts transactions most recent first", () => {
      const transactions = [
        secondTransaction,
        thirdTransaction,
        firstTransaction,
      ];
      expect(sortTransactionsById(transactions)).toEqual([
        thirdTransaction,
        secondTransaction,
        firstTransaction,
      ]);
    });
  });
});
