import {
  CREATE_CANISTER_MEMO,
  TOP_UP_CANISTER_MEMO,
} from "$lib/constants/api.constants";
import { NANO_SECONDS_IN_MILLISECOND } from "$lib/constants/constants";
import type { UiTransaction } from "$lib/types/transaction";
import {
  mapIcpTransactionToReport,
  mapIcpTransactionToUi,
  mapToSelfTransactions,
  sortTransactionsByIdDescendingOrder,
} from "$lib/utils/icp-transactions.utils";
import en from "$tests/mocks/i18n.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import type { Operation } from "@dfinity/ledger-icp";
import { ICPToken, TokenAmountV2 } from "@dfinity/utils";

describe("icp-transactions.utils", () => {
  const defaultTimestamp = new Date("2023-01-01T00:00:00.000Z");
  const to = "12345";
  const from = "56789";
  const amount = 200_000_000n;
  const fee = 10_000n;
  const transactionId = 1234n;
  const defaultTransferOperation: Operation = {
    Transfer: {
      to,
      fee: { e8s: fee },
      from,
      amount: { e8s: amount },
      spender: [],
    },
  };
  const defaultTokenAmountWithOutFee = TokenAmountV2.fromUlps({
    amount: amount,
    token: ICPToken,
  });
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
  const createTransaction = ({
    operation,
    memo,
    id = transactionId,
  }: {
    id?: bigint;
    operation: Operation;
    memo?: bigint;
  }) =>
    createTransactionWithId({
      id,
      timestamp: defaultTimestamp,
      operation,
      memo,
    });

  describe("mapIcpTransactionToReport", () => {
    it("should throw an error if no transaction information is found", () => {
      const transaction = createTransaction({
        operation: {
          // @ts-expect-error: Even though it is not possible our implementations handles it.
          Unknown: {},
        },
      });

      expect(() =>
        mapIcpTransactionToReport({
          transaction,
          accountIdentifier: from,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
        })
      ).toThrowError("Unknown transaction type Unknown");
    });

    it("should return transaction information", () => {
      const transaction = createTransaction({
        operation: defaultTransferOperation,
      });
      const expectedIcpTransaction = {
        type: "send",
        to,
        from,
        tokenAmount: defaultUiTransaction.tokenAmount,
        timestamp: defaultTimestamp,
      };

      expect(
        mapIcpTransactionToReport({
          transaction,
          accountIdentifier: from,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
        })
      ).toEqual(expectedIcpTransaction);
    });

    it("sould identify receive transactions", () => {
      const transaction = createTransaction({
        operation: {
          Transfer: {
            ...defaultTransferOperation.Transfer,
            to: from,
          },
        },
      });
      const expectedIcpTransaction = {
        type: "receive",
        to: from,
        from,
        tokenAmount: defaultTokenAmountWithOutFee,
        timestamp: defaultTimestamp,
      };

      expect(
        mapIcpTransactionToReport({
          transaction,
          accountIdentifier: from,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
        })
      ).toEqual(expectedIcpTransaction);
    });

    describe("should map to the correct transaction type", () => {
      it("maps stake neuron transaction", () => {
        const transaction = createTransaction({
          operation: defaultTransferOperation,
          memo: 12345n,
        });
        const expectedIcpTransaction = {
          type: "stakeNeuron",
          to,
          from,
          tokenAmount: defaultUiTransaction.tokenAmount,
          timestamp: defaultTimestamp,
        };

        expect(
          mapIcpTransactionToReport({
            transaction,
            accountIdentifier: from,
            neuronAccounts: new Set<string>([to]),
            swapCanisterAccounts: new Set<string>(),
          })
        ).toEqual(expectedIcpTransaction);
      });

      it("maps top up neuron transaction", () => {
        const transaction = createTransaction({
          operation: defaultTransferOperation,
          memo: 0n,
        });
        const expectedIcpTransaction = {
          type: "topUpNeuron",
          to,
          from,
          tokenAmount: defaultUiTransaction.tokenAmount,
          timestamp: defaultTimestamp,
        };

        expect(
          mapIcpTransactionToReport({
            transaction,
            accountIdentifier: from,
            neuronAccounts: new Set<string>([to]),
            swapCanisterAccounts: new Set<string>(),
          })
        ).toEqual(expectedIcpTransaction);
      });

      it("maps create canister transaction", () => {
        const transaction = createTransaction({
          operation: defaultTransferOperation,
          memo: CREATE_CANISTER_MEMO,
        });
        const expectedIcpTransaction = {
          type: "createCanister",
          to,
          from,
          tokenAmount: defaultUiTransaction.tokenAmount,
          timestamp: defaultTimestamp,
        };

        expect(
          mapIcpTransactionToReport({
            transaction,
            accountIdentifier: from,
            neuronAccounts: new Set<string>(),
            swapCanisterAccounts: new Set<string>(),
          })
        ).toEqual(expectedIcpTransaction);
      });

      it("maps top up canister transaction", () => {
        const transaction = createTransaction({
          operation: defaultTransferOperation,
          memo: TOP_UP_CANISTER_MEMO,
        });
        const expectedIcpTransaction = {
          type: "topUpCanister",
          to,
          from,
          tokenAmount: defaultUiTransaction.tokenAmount,
          timestamp: defaultTimestamp,
        };

        expect(
          mapIcpTransactionToReport({
            transaction,
            accountIdentifier: from,
            neuronAccounts: new Set<string>(),
            swapCanisterAccounts: new Set<string>(),
          })
        ).toEqual(expectedIcpTransaction);
      });
    });
  });

  describe("mapIcpTransactionToUi", () => {
    it("maps stake neuron transaction", () => {
      const transaction = createTransaction({
        operation: defaultTransferOperation,
        memo: 12345n,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Staked",
      };

      expect(
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
        operation: defaultTransferOperation,
        memo: 0n,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Top-up Neuron",
      };

      expect(
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
        operation: defaultTransferOperation,
        memo: CREATE_CANISTER_MEMO,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Create Canister",
      };

      expect(
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
        operation: defaultTransferOperation,
        memo: TOP_UP_CANISTER_MEMO,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Top-up Canister",
      };

      expect(
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
        operation: defaultTransferOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Decentralization Swap",
      };

      expect(
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
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
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
        operation: defaultTransferOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Sent",
      };

      expect(
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
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
        mapIcpTransactionToUi({
          transaction,
          accountIdentifier: to,
          toSelfTransaction: false,
          neuronAccounts: new Set<string>(),
          swapCanisterAccounts: new Set<string>(),
          i18n: en,
        })
      ).toEqual(expectedUiTransaction);
    });

    describe("maps timestamps", () => {
      const createdDate = new Date("2023-01-01T00:12:00.000Z");
      const blockDate = new Date("2023-01-01T00:34:00.000Z");
      const createTimestamps = {
        timestamp_nanos:
          BigInt(createdDate.getTime()) * BigInt(NANO_SECONDS_IN_MILLISECOND),
      };
      const blockTimestamps = {
        timestamp_nanos:
          BigInt(blockDate.getTime()) * BigInt(NANO_SECONDS_IN_MILLISECOND),
      };

      it("prefers block timestamp", () => {
        const transaction = createTransaction({
          operation: defaultTransferOperation,
        });
        transaction.transaction.created_at_time = [createTimestamps];
        transaction.transaction.timestamp = [blockTimestamps];

        const expectedUiTransaction: UiTransaction = {
          ...defaultUiTransaction,
          timestamp: blockDate,
        };

        expect(
          mapIcpTransactionToUi({
            transaction,
            accountIdentifier: from,
            toSelfTransaction: false,
            neuronAccounts: new Set<string>(),
            swapCanisterAccounts: new Set<string>(),
            i18n: en,
          })
        ).toEqual(expectedUiTransaction);
      });

      it("falls back on created timestamps", () => {
        const transaction = createTransaction({
          operation: defaultTransferOperation,
        });
        transaction.transaction.created_at_time = [createTimestamps];
        transaction.transaction.timestamp = [];

        const expectedUiTransaction: UiTransaction = {
          ...defaultUiTransaction,
          timestamp: createdDate,
        };

        expect(
          mapIcpTransactionToUi({
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

    it("maps toSelf transaction as Received", () => {
      const transaction = createTransaction({
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
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
        operation: toSelfOperation,
      });
      const expectedUiTransaction: UiTransaction = {
        ...defaultUiTransaction,
        headline: "Sent",
        domKey: `${transactionId}-1`,
        otherParty: from,
      };

      expect(
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
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
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
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
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
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
        mapIcpTransactionToUi({
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
      const transaction = createTransaction({
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
      const transaction = createTransaction({
        operation: toSelfOperation,
      });
      const notToSelfTransaction = createTransaction({
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

  describe("sortTransactionsByIdDescendingOrder", () => {
    const firstTransaction = createTransaction({
      operation: defaultTransferOperation,
      id: 10n,
    });
    const secondTransaction = createTransaction({
      operation: defaultTransferOperation,
      id: 20n,
    });
    const thirdTransaction = createTransaction({
      operation: defaultTransferOperation,
      id: 30n,
    });
    it("sorts transactions most recent first", () => {
      const transactions = [
        secondTransaction,
        thirdTransaction,
        firstTransaction,
      ];
      expect(sortTransactionsByIdDescendingOrder(transactions)).toEqual([
        thirdTransaction,
        secondTransaction,
        firstTransaction,
      ]);
    });
  });
});
