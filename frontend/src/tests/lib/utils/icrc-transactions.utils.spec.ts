import { NANO_SECONDS_IN_MILLISECOND } from "$lib/constants/constants";
import type { IcrcTransactionsStoreData } from "$lib/stores/icrc-transactions.store";
import type { IcrcTransactionData } from "$lib/types/transaction";
import {
  getOldestTxIdFromStore,
  getSortedTransactionsFromStore,
  getUniqueTransactions,
  isIcrcTransactionsCompleted,
  mapCkbtcPendingUtxo,
  mapCkbtcTransaction,
  mapCkbtcTransactions,
  mapIcrcTransaction,
  type MapIcrcTransactionType,
} from "$lib/utils/icrc-transactions.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSubAccountArray } from "$tests/mocks/icp-accounts.store.mock";
import {
  createApproveTransaction,
  createBurnTransaction,
  createIcrcTransactionWithId,
  createMintTransaction,
} from "$tests/mocks/icrc-transactions.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { Cbor } from "@dfinity/agent";
import type {
  RetrieveBtcStatusV2,
  RetrieveBtcStatusV2WithId,
} from "@dfinity/ckbtc";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import {
  ICPToken,
  TokenAmount,
  TokenAmountV2,
  toNullable,
} from "@dfinity/utils";

describe("icrc-transaction utils", () => {
  const subAccount = {
    owner: mockPrincipal,
    subaccount: [Uint8Array.from(mockSubAccountArray)] as [Uint8Array],
  };
  const mainAccount = {
    owner: mockPrincipal,
    subaccount: [] as [],
  };
  const transactionFromMainToSubaccount = createIcrcTransactionWithId({
    to: subAccount,
    from: mainAccount,
  });
  const recentTx = {
    id: BigInt(1234),
    transaction: {
      ...transactionFromMainToSubaccount.transaction,
      timestamp: BigInt(3000),
    },
  };
  const secondTx = {
    id: BigInt(1235),
    transaction: {
      ...transactionFromMainToSubaccount.transaction,
      timestamp: BigInt(2000),
    },
  };
  const oldestTx = {
    id: BigInt(1236),
    transaction: {
      ...transactionFromMainToSubaccount.transaction,
      timestamp: BigInt(1000),
    },
  };
  const selfTransaction = createIcrcTransactionWithId({
    from: subAccount,
    to: subAccount,
  });
  const retrieveBtcStatusReimbursed = (amount): RetrieveBtcStatusV2 => ({
    Reimbursed: {
      account: {
        owner: mockPrincipal,
        subaccount: [],
      },
      mint_block_index: 1256n,
      amount,
      reason: {
        CallFailed: null,
      },
    },
  });
  const retrieveBtcStatusPending: RetrieveBtcStatusV2 = {
    Pending: null,
  };
  const retrieveBtcStatusConfirmed: RetrieveBtcStatusV2 = {
    Confirmed: {
      txid: new Uint8Array([1, 2, 1, 1]),
    },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSortedTransactionsFromStore", () => {
    it("should return transactions sorted by date", () => {
      const transactions = [secondTx, oldestTx, recentTx];
      const store: IcrcTransactionsStoreData = {
        [mockPrincipal.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions,
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      const data = getSortedTransactionsFromStore({
        store,
        canisterId: mockPrincipal,
        account: mockSnsMainAccount,
      });
      expect(data[0]).toEqual({
        toSelfTransaction: false,
        transaction: recentTx,
      });
      expect(data[1]).toEqual({
        toSelfTransaction: false,
        transaction: secondTx,
      });
      expect(data[2]).toEqual({
        toSelfTransaction: false,
        transaction: oldestTx,
      });
    });

    it("should duplicate selfTransaction", () => {
      const store: IcrcTransactionsStoreData = {
        [mockSnsMainAccount.principal.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions: [selfTransaction],
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      const data = getSortedTransactionsFromStore({
        store,
        canisterId: mockPrincipal,
        account: mockSnsMainAccount,
      });
      expect(data[0]).toEqual({
        toSelfTransaction: true,
        transaction: selfTransaction,
      });
      // Only the first one should be set to true
      expect(data[1]).toEqual({
        toSelfTransaction: false,
        transaction: selfTransaction,
      });
    });
  });

  const testMapTransactionCommon = (mapTransaction: MapIcrcTransactionType) => {
    const defaultTimestamp = new Date("2023-01-01T00:00:00.000Z");
    const defaultTransactionParams = {
      id: 112n,
      from: mainAccount,
      to: subAccount,
      amount: 100_000_000n,
      fee: 10_000n,
      timestamp: defaultTimestamp,
    };
    const defaultParams = {
      transaction: createIcrcTransactionWithId(defaultTransactionParams),
      account: mockSnsMainAccount,
      toSelfTransaction: false,
      token: ICPToken,
      i18n: en,
    };
    const defaultExpectedData = {
      domKey: "112-1",
      headline: "Sent",
      isIncoming: false,
      isPending: false,
      otherParty: mockSnsSubAccount.identifier,
      timestamp: defaultTimestamp,
      tokenAmount: TokenAmountV2.fromUlps({
        amount: 100_010_000n,
        token: ICPToken,
      }),
    };

    it("maps sent transaction", () => {
      const data = mapTransaction({
        ...defaultParams,
        account: mockSnsMainAccount,
        transaction: createIcrcTransactionWithId({
          ...defaultTransactionParams,
          from: mainAccount,
          to: subAccount,
          amount: 200_000_000n,
          fee: 10_000n,
        }),
      });
      expect(data).toEqual({
        ...defaultExpectedData,
        headline: "Sent",
        isIncoming: false,
        otherParty: mockSnsSubAccount.identifier,
        // Includes fee
        tokenAmount: TokenAmountV2.fromUlps({
          amount: 200_010_000n,
          token: ICPToken,
        }),
      });
    });

    it("maps stake neuron transaction", () => {
      const governanceCanisterId = principal(2);
      const governanceSubaccount = Uint8Array.from([0, 0, 1]);
      const toGovernance = {
        owner: governanceCanisterId,
        subaccount: toNullable(governanceSubaccount),
      };
      const data = mapTransaction({
        ...defaultParams,
        transaction: createIcrcTransactionWithId({
          ...defaultTransactionParams,
          to: toGovernance,
          memo: new Uint8Array(),
        }),
        governanceCanisterId,
      });
      expect(data).toEqual({
        ...defaultExpectedData,
        headline: "Stake Neuron",
        otherParty: encodeIcrcAccount({
          owner: governanceCanisterId,
          subaccount: governanceSubaccount,
        }),
      });
    });

    it("maps top up neuron transaction", () => {
      const governanceCanisterId = principal(2);
      const governanceSubaccount = Uint8Array.from([0, 0, 1]);
      const toGovernance = {
        owner: governanceCanisterId,
        subaccount: toNullable(governanceSubaccount),
      };
      const data = mapTransaction({
        ...defaultParams,
        transaction: createIcrcTransactionWithId({
          ...defaultTransactionParams,
          to: toGovernance,
          memo: null,
        }),
        governanceCanisterId,
      });
      expect(data).toEqual({
        ...defaultExpectedData,
        headline: "Top-up Neuron",
        otherParty: encodeIcrcAccount({
          owner: governanceCanisterId,
          subaccount: governanceSubaccount,
        }),
      });
    });

    it("maps received transaction", () => {
      const data = mapTransaction({
        ...defaultParams,
        account: mockSnsSubAccount,
        transaction: createIcrcTransactionWithId({
          ...defaultTransactionParams,
          from: mainAccount,
          to: subAccount,
          amount: 300_000_000n,
          fee: 10_000n,
        }),
      });
      expect(data).toEqual({
        ...defaultExpectedData,
        headline: "Received",
        isIncoming: true,
        otherParty: mockSnsMainAccount.identifier,
        // Does not include fee
        tokenAmount: TokenAmountV2.fromUlps({
          amount: 300_000_000n,
          token: ICPToken,
        }),
      });
    });

    it("maps approve transaction", () => {
      const data = mapTransaction({
        ...defaultParams,
        transaction: {
          id: BigInt(1234),
          transaction: createApproveTransaction({
            timestamp:
              BigInt(defaultTimestamp.getTime()) *
              BigInt(NANO_SECONDS_IN_MILLISECOND),
            from: mainAccount,
            amount: 100_000_000n,
            spender: subAccount,
            createdAt:
              BigInt(defaultTimestamp.getTime()) *
              BigInt(NANO_SECONDS_IN_MILLISECOND),
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
      });
      expect(data).toEqual({
        ...defaultExpectedData,
        domKey: "1234-1",
        headline: "Approve transfer",
        tokenAmount: TokenAmountV2.fromUlps({
          amount: 10_000n,
          token: ICPToken,
        }),
        otherParty: undefined,
      });
    });

    it("maps self transaction", () => {
      const data = mapTransaction({
        ...defaultParams,
        transaction: createIcrcTransactionWithId({
          ...defaultTransactionParams,
          id: 112n,
          from: mainAccount,
          to: mainAccount,
          amount: 400_000_000n,
          fee: 10_000n,
        }),
        toSelfTransaction: true,
      });
      expect(data).toEqual({
        ...defaultExpectedData,
        domKey: "112-0",
        headline: "Received",
        isIncoming: true,
        otherParty: mockSnsMainAccount.identifier,
        // Does not include fee
        tokenAmount: TokenAmountV2.fromUlps({
          amount: 400_000_000n,
          token: ICPToken,
        }),
      });
    });
  };

  describe("mapSnsTransaction", () => {
    testMapTransactionCommon(mapIcrcTransaction);

    it("maps burn transaction", () => {
      const amount = 35_000_000n;
      const data = mapIcrcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createBurnTransaction({
            from: mainAccount,
            amount,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: ICPToken,
        i18n: en,
      });
      expect(data).toEqual({
        domKey: "1234-1",
        headline: "Sent",
        isIncoming: false,
        isPending: false,
        otherParty: undefined,
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: ICPToken,
        }),
      });
    });
  });

  describe("mapCkbtcTransaction", () => {
    testMapTransactionCommon(mapCkbtcTransaction);

    it("Decodes BTC withdrawal address from cbor memo on Burn transaction", () => {
      const amount = 45_000_000n;
      const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
      const kytFee = 1333;
      const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
      const memo = new Uint8Array(Cbor.encode(decodedMemo));

      const data = mapCkbtcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createBurnTransaction({
            amount,
            from: mainAccount,
            memo,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: mockCkBTCToken,
        i18n: en,
      });
      expect(data).toEqual({
        domKey: "1234-1",
        headline: "BTC Sent",
        isIncoming: false,
        isPending: false,
        otherParty: btcWithdrawalAddress,
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: mockCkBTCToken,
        }),
      });
    });

    it("Maps burn transaction without memo", () => {
      // We expect every ckBTC transaction to have a cbor-encoded memo, but when
      // it doesn't it should fail gracefully.
      const errorLog = [];
      vi.spyOn(console, "error").mockImplementation((msg) =>
        errorLog.push(msg)
      );

      const amount = 68_000_000n;

      const data = mapCkbtcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createBurnTransaction({
            amount,
            from: mainAccount,
            memo: undefined,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: mockCkBTCToken,
        i18n: en,
      });

      expect(data).toEqual({
        domKey: "1234-1",
        headline: "BTC Sent",
        isIncoming: false,
        isPending: false,
        otherParty: "BTC Network",
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: mockCkBTCToken,
        }),
      });

      expect(errorLog).toEqual(["Failed to decode ckBTC burn memo"]);
    });

    it("Renders mint transaction as 'From: BTC Network'", () => {
      const amount = 25_000_000n;

      const data = mapCkbtcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createMintTransaction({
            amount,
            to: mainAccount,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: mockCkBTCToken,
        i18n: en,
      });
      expect(data).toEqual({
        domKey: "1234-1",
        headline: "BTC Received",
        isIncoming: true,
        isPending: false,
        otherParty: "BTC Network",
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: mockCkBTCToken,
        }),
      });
    });

    it("Renders a reimbursement transaction", () => {
      const amount = 41_000_000n;
      const kytFee = 1331;
      const decodedMemo = [2, [kytFee, 1, 123]];
      const memo = new Uint8Array(Cbor.encode(decodedMemo));

      const data = mapCkbtcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createMintTransaction({
            amount,
            to: mainAccount,
            memo,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: mockCkBTCToken,
        i18n: en,
      });
      expect(data).toEqual({
        domKey: "1234-1",
        headline: "Reimbursement",
        isIncoming: true,
        isPending: false,
        isReimbursement: true,
        otherParty: "BTC Network",
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: mockCkBTCToken,
        }),
      });
    });

    it("Renders a pending burn transaction as pending", () => {
      const amount = 76_000_000n;
      const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
      const kytFee = 1333;
      const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
      const memo = new Uint8Array(Cbor.encode(decodedMemo));

      const data = mapCkbtcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createBurnTransaction({
            amount,
            from: mainAccount,
            memo,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: mockCkBTCToken,
        i18n: en,
        retrieveBtcStatus: retrieveBtcStatusPending,
      });
      expect(data).toEqual({
        domKey: "1234-1",
        headline: "Sending BTC",
        isIncoming: false,
        isPending: true,
        otherParty: btcWithdrawalAddress,
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: mockCkBTCToken,
        }),
      });
    });

    it("Renders a confirmed burn transaction as sent", () => {
      const amount = 76_000_000n;
      const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
      const kytFee = 1333;
      const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
      const memo = new Uint8Array(Cbor.encode(decodedMemo));

      const data = mapCkbtcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createBurnTransaction({
            amount,
            from: mainAccount,
            memo,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: mockCkBTCToken,
        i18n: en,
        retrieveBtcStatus: retrieveBtcStatusConfirmed,
      });
      expect(data).toEqual({
        domKey: "1234-1",
        headline: "BTC Sent",
        isIncoming: false,
        isPending: false,
        otherParty: btcWithdrawalAddress,
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: mockCkBTCToken,
        }),
      });
    });

    it("Renders a reimbursed burn transaction as failed", () => {
      const amount = 75_000_000n;
      const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
      const kytFee = 1333;
      const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
      const memo = new Uint8Array(Cbor.encode(decodedMemo));

      const retrieveBtcStatus = retrieveBtcStatusReimbursed(amount);

      const data = mapCkbtcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createBurnTransaction({
            amount,
            from: mainAccount,
            memo,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: mockCkBTCToken,
        i18n: en,
        retrieveBtcStatus,
      });
      expect(data).toEqual({
        domKey: "1234-1",
        headline: "Sending BTC failed",
        isIncoming: false,
        isPending: false,
        isFailed: true,
        otherParty: btcWithdrawalAddress,
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: mockCkBTCToken,
        }),
      });
    });

    it("Renders a legacy mint memo as standard incoming BTC", () => {
      const amount = 41_000_000n;
      const txIdMemo = new Uint8Array(32).fill(99);

      const data = mapCkbtcTransaction({
        transaction: {
          id: BigInt(1234),
          transaction: createMintTransaction({
            amount,
            to: mainAccount,
            memo: txIdMemo,
          }),
        },
        account: mockCkBTCMainAccount,
        toSelfTransaction: false,
        token: mockCkBTCToken,
        i18n: en,
      });
      expect(data).toEqual({
        domKey: "1234-1",
        headline: "BTC Received",
        isIncoming: true,
        isPending: false,
        otherParty: "BTC Network",
        timestamp: new Date(0),
        tokenAmount: TokenAmountV2.fromUlps({
          amount,
          token: mockCkBTCToken,
        }),
      });
    });
  });

  describe("mapCkbtcTransactions", () => {
    it("maps multiple transactions", () => {
      const sentTx: IcrcTransactionData = {
        transaction: createIcrcTransactionWithId({
          id: 104n,
          from: mainAccount,
          to: subAccount,
          amount: 200_000_000n,
          fee: 10_000n,
        }),
        toSelfTransaction: false,
      };
      const receivedTx: IcrcTransactionData = {
        transaction: createIcrcTransactionWithId({
          id: 103n,
          from: subAccount,
          to: mainAccount,
          amount: 300_000_000n,
          fee: 10_000n,
        }),
        toSelfTransaction: false,
      };

      const uiTransactions = mapCkbtcTransactions({
        transactionData: [sentTx, receivedTx],
        account: mockCkBTCMainAccount,
        token: mockCkBTCToken,
        i18n: en,
        retrieveBtcStatuses: [],
      });

      expect(uiTransactions).toEqual([
        {
          domKey: "104-1",
          headline: "Sent",
          isIncoming: false,
          isPending: false,
          otherParty: mockSnsSubAccount.identifier,
          timestamp: new Date(0),
          tokenAmount: TokenAmountV2.fromUlps({
            amount: 200010000n,
            token: mockCkBTCToken,
          }),
        },
        {
          domKey: "103-1",
          headline: "Received",
          isIncoming: true,
          isPending: false,
          otherParty: mockSnsSubAccount.identifier,
          timestamp: new Date(0),
          tokenAmount: TokenAmountV2.fromUlps({
            amount: 300000000n,
            token: mockCkBTCToken,
          }),
        },
      ]);
    });

    it("Merges Approve transaction with corresponding Burn transaction", () => {
      const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
      const kytFee = 1333;
      const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
      const memo = new Uint8Array(Cbor.encode(decodedMemo));

      const burnAmount = 200_000_000n;
      const approveFee = 13n;

      const approveTx: IcrcTransactionData = {
        transaction: {
          id: 101n,
          transaction: createApproveTransaction({
            fee: approveFee,
          }),
        },
        toSelfTransaction: false,
      };
      const burnTx: IcrcTransactionData = {
        transaction: {
          id: 102n,
          transaction: createBurnTransaction({
            amount: burnAmount,
            memo,
          }),
        },
        toSelfTransaction: false,
      };

      const uiTransactions = mapCkbtcTransactions({
        transactionData: [burnTx, approveTx],
        account: mockCkBTCMainAccount,
        token: mockCkBTCToken,
        i18n: en,
        retrieveBtcStatuses: [],
      });

      // The approve transaction was merged into the burn transaction so is not
      // rendered separately.
      expect(uiTransactions.length).toEqual(1);

      const burnUiTransaction = uiTransactions[0];

      expect(burnUiTransaction.headline).toBe("BTC Sent");
      expect(burnUiTransaction.tokenAmount).toEqual(
        TokenAmountV2.fromUlps({
          amount: burnAmount + approveFee,
          token: mockCkBTCToken,
        })
      );
    });

    it("Does not merge Approve transaction with normal Transfer transaction", () => {
      const transferAmount = 400_000_000n;
      const approveFee = 13n;
      const transferFee = 10n;

      const approveTx: IcrcTransactionData = {
        transaction: {
          id: 101n,
          transaction: createApproveTransaction({
            fee: approveFee,
            from: mainAccount,
          }),
        },
        toSelfTransaction: false,
      };
      const transferTx: IcrcTransactionData = {
        transaction: createIcrcTransactionWithId({
          id: 102n,
          amount: transferAmount,
          fee: transferFee,
        }),
        toSelfTransaction: false,
      };

      const uiTransactions = mapCkbtcTransactions({
        transactionData: [transferTx, approveTx],
        account: mockCkBTCMainAccount,
        token: mockCkBTCToken,
        i18n: en,
        retrieveBtcStatuses: [],
      });

      expect(uiTransactions.length).toEqual(2);
      expect(uiTransactions[0].headline).toBe("Sent");
      expect(uiTransactions[1].headline).toBe("Approve transfer");
    });

    it("takes BTC retrieve status into account", () => {
      const btcWithdrawalAddress = "1ASLxsAMbbt4gcrNc6v6qDBW4JkeWAtTeh";
      const kytFee = 1333;
      const decodedMemo = [0, [btcWithdrawalAddress, kytFee, undefined]];
      const memo = new Uint8Array(Cbor.encode(decodedMemo));

      const failedTxId = 131n;
      const failedAmount = 170_000_000n;
      const pendingTxId = 137n;
      const pendingAmount = 180_000_000n;
      const confirmedTxId = 139n;
      const confirmedAmount = 190_000_000n;

      const failedTx: IcrcTransactionData = {
        transaction: {
          id: failedTxId,
          transaction: createBurnTransaction({
            from: mainAccount,
            amount: failedAmount,
            memo,
          }),
        },
        toSelfTransaction: false,
      };
      const pendingTx: IcrcTransactionData = {
        transaction: {
          id: pendingTxId,
          transaction: createBurnTransaction({
            from: mainAccount,
            amount: pendingAmount,
            memo,
          }),
        },
        toSelfTransaction: false,
      };
      const confirmedTx: IcrcTransactionData = {
        transaction: {
          id: confirmedTxId,
          transaction: createBurnTransaction({
            from: mainAccount,
            amount: confirmedAmount,
            memo,
          }),
        },
        toSelfTransaction: false,
      };
      const statuses: RetrieveBtcStatusV2WithId[] = [
        {
          id: failedTxId,
          status: retrieveBtcStatusReimbursed(failedAmount),
        },
        {
          id: pendingTxId,
          status: retrieveBtcStatusPending,
        },
        {
          id: confirmedTxId,
          status: retrieveBtcStatusConfirmed,
        },
      ];

      const uiTransactions = mapCkbtcTransactions({
        transactionData: [confirmedTx, pendingTx, failedTx],
        account: mockCkBTCMainAccount,
        token: mockCkBTCToken,
        i18n: en,
        retrieveBtcStatuses: statuses,
      });

      expect(uiTransactions).toEqual([
        {
          domKey: `${confirmedTxId}-1`,
          headline: "BTC Sent",
          isIncoming: false,
          isPending: false,
          otherParty: btcWithdrawalAddress,
          timestamp: new Date(0),
          tokenAmount: TokenAmountV2.fromUlps({
            amount: confirmedAmount,
            token: mockCkBTCToken,
          }),
        },
        {
          domKey: `${pendingTxId}-1`,
          headline: "Sending BTC",
          isIncoming: false,
          isPending: true,
          otherParty: btcWithdrawalAddress,
          timestamp: new Date(0),
          tokenAmount: TokenAmountV2.fromUlps({
            amount: pendingAmount,
            token: mockCkBTCToken,
          }),
        },
        {
          domKey: `${failedTxId}-1`,
          headline: "Sending BTC failed",
          isIncoming: false,
          isPending: false,
          isFailed: true,
          otherParty: btcWithdrawalAddress,
          timestamp: new Date(0),
          tokenAmount: TokenAmountV2.fromUlps({
            amount: failedAmount,
            token: mockCkBTCToken,
          }),
        },
      ]);
    });
  });

  describe("mapCkbtcPendingUtxo", () => {
    it("maps PendingUtxo to uiTransaction ", () => {
      const amount = 23_000_000n;
      const kytFee = 5_000n;
      const utxo = {
        outpoint: {
          txid: new Uint8Array([2, 3, 2]),
          vout: 2,
        },
        value: amount,
        confirmations: 3,
      };
      const uiTransaction = mapCkbtcPendingUtxo({
        utxo,
        token: mockCkBTCToken,
        kytFee,
        i18n: en,
      });
      expect(uiTransaction).toEqual({
        domKey: "020302-2",
        isIncoming: true,
        isPending: true,
        headline: "Receiving BTC",
        otherParty: "BTC Network",
        tokenAmount: TokenAmount.fromE8s({
          amount: amount - kytFee,
          token: mockCkBTCToken,
        }),
      });
    });
  });

  describe("getOldestTransactionId", () => {
    const recentTx = {
      id: BigInt(1234),
      transaction: {
        ...transactionFromMainToSubaccount.transaction,
        timestamp: BigInt(3000),
      },
    };
    const secondTx = {
      id: BigInt(1235),
      transaction: {
        ...transactionFromMainToSubaccount.transaction,
        timestamp: BigInt(2000),
      },
    };
    const oldestTx = {
      id: BigInt(1236),
      transaction: {
        ...transactionFromMainToSubaccount.transaction,
        timestamp: BigInt(1000),
      },
    };

    it("returns the id of the oldest tx", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const transactions = [secondTx, oldestTx, recentTx];
      const store: IcrcTransactionsStoreData = {
        [rootCanisterId.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions,
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      expect(
        getOldestTxIdFromStore({
          store,
          canisterId: rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBe(oldestTx.id);
    });

    it("returns undefined if no data is found", () => {
      expect(
        getOldestTxIdFromStore({
          store: {},
          canisterId: mockSnsMainAccount.principal,
          account: mockSnsMainAccount,
        })
      ).toBeUndefined();
    });

    it("returns undefined if empty data", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const transactions = [];
      const store: IcrcTransactionsStoreData = {
        [rootCanisterId.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions,
            completed: false,
            oldestTxId: BigInt(1234),
          },
        },
      };
      expect(
        getOldestTxIdFromStore({
          store,
          canisterId: rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBeUndefined();
    });
  });

  describe("isTransactionsCompleted", () => {
    it("returns the value in store", () => {
      const rootCanisterId = mockSnsMainAccount.principal;
      const store: IcrcTransactionsStoreData = {
        [rootCanisterId.toText()]: {
          [mockSnsMainAccount.identifier]: {
            transactions: [transactionFromMainToSubaccount],
            completed: false,
            oldestTxId: BigInt(1234),
          },
          [mockSnsSubAccount.identifier]: {
            transactions: [transactionFromMainToSubaccount],
            completed: true,
            oldestTxId: BigInt(1234),
          },
        },
      };
      expect(
        isIcrcTransactionsCompleted({
          store,
          canisterId: rootCanisterId,
          account: mockSnsMainAccount,
        })
      ).toBe(false);
      expect(
        isIcrcTransactionsCompleted({
          store,
          canisterId: rootCanisterId,
          account: mockSnsSubAccount,
        })
      ).toBe(true);
    });
  });

  describe("getUniqueTransactions", () => {
    const mainAccount = {
      owner: mockPrincipal,
      subaccount: [] as [] | [Uint8Array],
    };
    const subAccount = {
      owner: mockPrincipal,
      subaccount: [new Uint8Array([1, 2, 3])] as [] | [Uint8Array],
    };
    const txA = createIcrcTransactionWithId({
      id: 1n,
      from: mainAccount,
      to: subAccount,
    });
    const txB = createIcrcTransactionWithId({
      id: 2n,
      from: subAccount,
      to: mainAccount,
    });
    const txC = createIcrcTransactionWithId({
      id: 3n,
      from: mainAccount,
      to: mainAccount,
    });

    it("empty array", () => {
      expect(getUniqueTransactions([])).toEqual([]);
    });

    it("singleton array", () => {
      const transactions = [txA];
      expect(getUniqueTransactions(transactions)).toEqual(transactions);
    });

    it("duplicate transactions", () => {
      const transactions = [txA, txA];
      expect(getUniqueTransactions(transactions)).toEqual([txA]);
    });

    it("multiple different transactions", () => {
      const transactions = [txA, txB, txC];
      expect(getUniqueTransactions(transactions)).toEqual(transactions);
    });

    it("non-consecutive duplicate transactions", () => {
      const transactions = [txA, txB, txC, txA, txC, txB, txA, txC];
      expect(getUniqueTransactions(transactions)).toEqual([txA, txB, txC]);
    });
  });
});
