import { TokenAmount } from "@dfinity/nns";
import type { Transaction } from "../../../lib/canisters/nns-dapp/nns-dapp.types";
import { enumKeys } from "../../../lib/utils/enum.utils";
import {
  accountName,
  AccountTransactionType,
  mapToSelfTransaction,
  mapTransaction,
  showTransactionFee,
  transactionDisplayAmount,
  transactionName,
  transactionType,
} from "../../../lib/utils/transactions.utils";
import {
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import {
  mockReceivedFromMainAccountTransaction,
  mockSentToSubAccountTransaction,
} from "../../mocks/transaction.mock";

describe("transactions-utils", () => {
  describe("showTransactionFee", () => {
    it("should be false for received transactions", () => {
      expect(
        showTransactionFee({
          type: AccountTransactionType.Send,
          isReceive: true,
        })
      ).toBeFalsy();
      expect(
        showTransactionFee({
          type: AccountTransactionType.Mint,
          isReceive: true,
        })
      ).toBeFalsy();
    });

    it("should be false for sent Mint and Burn", () => {
      expect(
        showTransactionFee({
          type: AccountTransactionType.Mint,
          isReceive: false,
        })
      ).toBeFalsy();
      expect(
        showTransactionFee({
          type: AccountTransactionType.Burn,
          isReceive: false,
        })
      ).toBeFalsy();
    });

    it("should be true for Sent", () => {
      expect(
        showTransactionFee({
          type: AccountTransactionType.Send,
          isReceive: false,
        })
      ).toBeTruthy();
      expect(
        showTransactionFee({
          type: AccountTransactionType.StakeNeuron,
          isReceive: false,
        })
      ).toBeTruthy();
    });
  });

  describe("transactionType", () => {
    it("determines type by transaction_type value", () => {
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [{ Transfer: null }],
        })
      ).toBe(AccountTransactionType.Send);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [{ Burn: null }],
        })
      ).toBe(AccountTransactionType.Burn);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [{ Mint: null }],
        })
      ).toBe(AccountTransactionType.Mint);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [{ StakeNeuronNotification: null }],
        })
      ).toBe(AccountTransactionType.StakeNeuronNotification);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [{ TopUpCanister: mockPrincipal }],
        })
      ).toBe(AccountTransactionType.TopUpCanister);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [{ CreateCanister: null }],
        })
      ).toBe(AccountTransactionType.CreateCanister);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [{ TopUpNeuron: null }],
        })
      ).toBe(AccountTransactionType.TopUpNeuron);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [{ StakeNeuron: null }],
        })
      ).toBe(AccountTransactionType.StakeNeuron);
    });

    it("determines type withoug transaction_type value", () => {
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          transaction_type: [],
        })
      ).toBe(AccountTransactionType.Send);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          Burn: null,
          transaction_type: [],
        } as unknown as Transaction)
      ).toBe(AccountTransactionType.Burn);
      expect(
        transactionType({
          ...mockSentToSubAccountTransaction,
          Mint: null,
          transaction_type: [],
        } as unknown as Transaction)
      ).toBe(AccountTransactionType.Mint);
    });

    it("throws if unknown type", () => {
      expect(() =>
        transactionType({
          ...mockSentToSubAccountTransaction,
          // @ts-ignore-line: test
          transaction_type: [{ Unknown: null }],
        })
      ).toThrow();
    });
  });

  describe("mapToSelfTransaction", () => {
    it("should map to self transactions", () => {
      const transactions = mapToSelfTransaction([
        {
          ...mockSentToSubAccountTransaction,
          timestamp: { timestamp_nanos: BigInt("111") },
        },
        mockReceivedFromMainAccountTransaction,
        mockReceivedFromMainAccountTransaction,
        {
          ...mockSentToSubAccountTransaction,
          timestamp: { timestamp_nanos: BigInt("222") },
        },
        {
          ...mockSentToSubAccountTransaction,
          timestamp: { timestamp_nanos: BigInt("333") },
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

  describe("mapTransaction", () => {
    it("should map Send transaction", () => {
      const { type, isReceive, isSend, from, to, displayAmount, date } =
        mapTransaction({
          transaction: mockSentToSubAccountTransaction,
          account: mockMainAccount,
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const amount = (mockSentToSubAccountTransaction.transfer as any)?.Send
        ?.amount.e8s as bigint;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fee = (mockSentToSubAccountTransaction.transfer as any)?.Send?.fee
        .e8s as bigint;

      expect(type).toBe(transactionType(mockSentToSubAccountTransaction));
      expect(isReceive).toBeFalsy();
      expect(isSend).toBeTruthy();
      expect(from).toBe(mockMainAccount.identifier);
      expect(to).toBe(mockSubAccount.identifier);
      expect(displayAmount.toE8s()).toBe(
        transactionDisplayAmount({
          useFee: true,
          amount: TokenAmount.fromE8s({ amount }),
          fee: TokenAmount.fromE8s({ amount: fee }),
        }).toE8s()
      );
      expect(+date).toBe(
        Number(
          mockSentToSubAccountTransaction.timestamp.timestamp_nanos /
            BigInt(1e6)
        )
      );
    });

    it("should map Receive transaction", () => {
      const { type, isReceive, isSend, from, to, displayAmount, date } =
        mapTransaction({
          transaction: mockReceivedFromMainAccountTransaction,
          account: mockSubAccount,
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const amount = (mockReceivedFromMainAccountTransaction.transfer as any)
        ?.Receive?.amount.e8s as bigint;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fee = (mockReceivedFromMainAccountTransaction.transfer as any)
        ?.Receive?.fee.e8s as bigint;

      expect(type).toBe(
        transactionType(mockReceivedFromMainAccountTransaction)
      );
      expect(isSend).toBeFalsy();
      expect(isReceive).toBeTruthy();
      expect(from).toBe(mockMainAccount.identifier);
      expect(to).toBe(mockSubAccount.identifier);
      expect(displayAmount.toE8s()).toBe(
        transactionDisplayAmount({
          useFee: false,
          amount: TokenAmount.fromE8s({ amount }),
          fee: TokenAmount.fromE8s({ amount: fee }),
        }).toE8s()
      );
      expect(+date).toBe(
        Number(
          mockReceivedFromMainAccountTransaction.timestamp.timestamp_nanos /
            BigInt(1e6)
        )
      );
    });

    it("should support toSelfTransaction", () => {
      const { isReceive, isSend, displayAmount } = mapTransaction({
        transaction: mockSentToSubAccountTransaction,
        account: mockSubAccount,
        toSelfTransaction: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const amount = (mockSentToSubAccountTransaction.transfer as any)?.Send
        ?.amount.e8s as bigint;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fee = (mockSentToSubAccountTransaction.transfer as any)?.Send?.fee
        .e8s as bigint;

      expect(displayAmount.toE8s()).toBe(
        transactionDisplayAmount({
          useFee: false,
          amount: TokenAmount.fromE8s({ amount }),
          fee: TokenAmount.fromE8s({ amount: fee }),
        }).toE8s()
      );
      expect(isSend).toBeFalsy();
      expect(isReceive).toBeTruthy();
    });
  });

  describe("accountName", () => {
    it("returns subAccount name", () => {
      expect(
        accountName({
          account: mockSubAccount,
          mainName: "main",
        })
      ).toBe(mockSubAccount.name);
    });

    it("returns main account name", () => {
      expect(
        accountName({
          account: mockMainAccount,
          mainName: "main",
        })
      ).toBe("main");
    });

    it('returns "" if no account', () => {
      expect(
        accountName({
          account: undefined,
          mainName: "main",
        })
      ).toBe("");
    });
  });

  describe("transactionDisplayAmount", () => {
    it("should calculate with fee", () => {
      expect(
        transactionDisplayAmount({
          useFee: true,
          amount: TokenAmount.fromE8s({ amount: BigInt(222) }),
          fee: TokenAmount.fromE8s({ amount: BigInt(333) }),
        }).toE8s()
      ).toBe(BigInt(222 + 333));
    });

    it("should calculate without fee", () => {
      expect(
        transactionDisplayAmount({
          useFee: false,
          amount: TokenAmount.fromE8s({ amount: BigInt(222) }),
          fee: TokenAmount.fromE8s({ amount: BigInt(333) }),
        }).toE8s()
      ).toBe(BigInt(222));
    });

    it("should throw when no fee", () => {
      expect(() =>
        transactionDisplayAmount({
          useFee: true,
          amount: TokenAmount.fromE8s({ amount: BigInt(222) }),
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
            labels: en.transaction_names,
          })
        ).toBe(en.transaction_names[key as AccountTransactionType]);
      }
    });

    it("returns received name", () => {
      expect(
        transactionName({
          type: AccountTransactionType.Send,
          isReceive: true,
          labels: en.transaction_names,
        })
      ).toBe(en.transaction_names.receive);
    });

    it("returns raw type if not label", () => {
      expect(
        transactionName({
          type: "test" as AccountTransactionType,
          isReceive: true,
          labels: en.transaction_names,
        })
      ).toBe("test");
    });
  });
});
