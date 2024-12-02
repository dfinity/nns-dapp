import {
  AccountTransactionType,
  TransactionNetwork,
} from "$lib/types/transaction";
import { enumKeys } from "$lib/utils/enum.utils";
import {
  getUniqueTransactions,
  isTransactionNetworkBtc,
  transactionDisplayAmount,
  transactionName,
} from "$lib/utils/transactions.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { createIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";

describe("transactions-utils", () => {
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
            i18n: en,
          })
        ).toBe(en.transaction_names[key as AccountTransactionType]);
      }
    });

    it("returns received name", () => {
      expect(
        transactionName({
          type: AccountTransactionType.Send,
          i18n: en,
        })
      ).toBe(en.transaction_names.receive);
    });

    it("returns raw type if not label", () => {
      expect(
        transactionName({
          type: "test" as AccountTransactionType,
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
