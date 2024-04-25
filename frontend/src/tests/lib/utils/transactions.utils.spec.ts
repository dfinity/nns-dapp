import type { Transaction as NnsTransaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  AccountTransactionType,
  TransactionNetwork,
} from "$lib/types/transaction";
import { enumKeys } from "$lib/utils/enum.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import {
  getUniqueTransactions,
  isTransactionNetworkBtc,
  mapToSelfTransaction,
  transactionDisplayAmount,
  transactionName,
  transactionType,
} from "$lib/utils/transactions.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { createIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  mockReceivedFromMainAccountTransaction,
  mockSentToSubAccountTransaction,
} from "$tests/mocks/transaction.mock";

describe("transactions-utils", () => {
  describe("transactionType", () => {
    it("determines type by transaction_type value", () => {
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [{ Transfer: null }],
          },
        })
      ).toBe(AccountTransactionType.Send);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [{ Burn: null }],
          },
        })
      ).toBe(AccountTransactionType.Burn);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [{ Mint: null }],
          },
        })
      ).toBe(AccountTransactionType.Mint);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [{ StakeNeuronNotification: null }],
          },
        })
      ).toBe(AccountTransactionType.StakeNeuronNotification);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [{ TopUpCanister: mockPrincipal }],
          },
        })
      ).toBe(AccountTransactionType.TopUpCanister);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [{ CreateCanister: null }],
          },
        })
      ).toBe(AccountTransactionType.CreateCanister);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [{ TopUpNeuron: null }],
          },
        })
      ).toBe(AccountTransactionType.TopUpNeuron);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [{ StakeNeuron: null }],
          },
        })
      ).toBe(AccountTransactionType.StakeNeuron);
    });

    it("determines type by swapCanisterAccounts and Sent transaction", () => {
      const swapCanisterId = principal(0);
      const swapCanisterAccount = getSwapCanisterAccount({
        controller: mockMainAccount.principal,
        swapCanisterId,
      });
      const swapTransaction: NnsTransaction = {
        ...mockReceivedFromMainAccountTransaction,
        transfer: {
          Send: {
            fee: { e8s: 10_000n },
            amount: { e8s: 110_000_000n },
            to: swapCanisterAccount.toHex(),
          },
        },
      };
      expect(
        transactionType({
          transaction: swapTransaction,
          swapCanisterAccounts: new Set([swapCanisterAccount.toHex()]),
        })
      ).toBe(AccountTransactionType.ParticipateSwap);
    });

    it("determines type by swapCanisterAccounts and Receive transaction", () => {
      const swapCanisterId = principal(0);
      const swapCanisterAccount = getSwapCanisterAccount({
        controller: mockMainAccount.principal,
        swapCanisterId,
      });
      const swapTransaction: NnsTransaction = {
        ...mockReceivedFromMainAccountTransaction,
        transfer: {
          Receive: {
            fee: { e8s: 10_000n },
            amount: { e8s: 110_000_000n },
            from: swapCanisterAccount.toHex(),
          },
        },
      };
      expect(
        transactionType({
          transaction: swapTransaction,
          swapCanisterAccounts: new Set([swapCanisterAccount.toHex()]),
        })
      ).toBe(AccountTransactionType.RefundSwap);
    });

    it("determines type withoug transaction_type value", () => {
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            transaction_type: [],
          },
        })
      ).toBe(AccountTransactionType.Send);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            Burn: null,
            transaction_type: [],
          } as unknown as NnsTransaction,
        })
      ).toBe(AccountTransactionType.Burn);
      expect(
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            Mint: null,
            transaction_type: [],
          } as unknown as NnsTransaction,
        })
      ).toBe(AccountTransactionType.Mint);
    });

    it("throws if unknown type", () => {
      expect(() =>
        transactionType({
          transaction: {
            ...mockSentToSubAccountTransaction,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore-line: test
            transaction_type: [{ Unknown: null }],
          },
        })
      ).toThrow();
    });
  });

  describe("mapToSelfTransaction", () => {
    it("should map to self transactions", () => {
      const transactions = mapToSelfTransaction([
        {
          ...mockSentToSubAccountTransaction,
          timestamp: { timestamp_nanos: 111n },
        },
        mockReceivedFromMainAccountTransaction,
        mockReceivedFromMainAccountTransaction,
        {
          ...mockSentToSubAccountTransaction,
          timestamp: { timestamp_nanos: 222n },
        },
        {
          ...mockSentToSubAccountTransaction,
          timestamp: { timestamp_nanos: 333n },
        },
        mockSentToSubAccountTransaction,
        mockSentToSubAccountTransaction,
      ]);

      const toSelfTransactions = transactions.map(
        ({ toSelfTransaction }) => toSelfTransaction
      );

      expect(toSelfTransactions).toEqual([
        false,
        true,
        false,
        false,
        false,
        true,
        false,
      ]);
    });
  });

  describe("transactionDisplayAmount", () => {
    it("should calculate with fee", () => {
      expect(
        transactionDisplayAmount({
          useFee: true,
          amount: 222n,
          fee: 333n,
        })
      ).toBe(222n + 333n);
    });

    it("should calculate without fee", () => {
      expect(
        transactionDisplayAmount({
          useFee: false,
          amount: 222n,
          fee: 333n,
        })
      ).toBe(222n);
    });

    it("should throw when no fee", () => {
      expect(() =>
        transactionDisplayAmount({
          useFee: true,
          amount: 222n,
          fee: undefined,
        })
      ).toThrow();
    });
  });

  describe("transactionName", () => {
    it("returns all known types name", () => {
      for (const key of enumKeys(AccountTransactionType)) {
        expect(
          transactionName({
            type: key as AccountTransactionType,
            isReceive: false,
            i18n: en,
          })
        ).toBe(en.transaction_names[key as AccountTransactionType]);
      }
    });

    it("returns received name", () => {
      expect(
        transactionName({
          type: AccountTransactionType.Send,
          isReceive: true,
          i18n: en,
        })
      ).toBe(en.transaction_names.receive);
    });

    it("returns raw type if not label", () => {
      expect(
        transactionName({
          type: "test" as AccountTransactionType,
          isReceive: true,
          i18n: en,
        })
      ).toBe("test");
    });
  });

  describe("isTransactionNetworkBtc", () => {
    it("should be network Btc", () => {
      expect(
        isTransactionNetworkBtc(TransactionNetwork.BTC_MAINNET)
      ).toBeTruthy();
      expect(
        isTransactionNetworkBtc(TransactionNetwork.BTC_TESTNET)
      ).toBeTruthy();
    });

    it("should not be network Btc", () => {
      expect(isTransactionNetworkBtc(TransactionNetwork.ICP)).toBe(false);
      expect(isTransactionNetworkBtc(TransactionNetwork.ICP)).toBe(false);
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
