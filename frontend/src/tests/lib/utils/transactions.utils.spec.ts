import type { Transaction as NnsTransaction } from "$lib/canisters/nns-dapp/nns-dapp.types";
import {
  AccountTransactionType,
  TransactionNetwork,
  type Transaction,
  type UiTransaction,
} from "$lib/types/transaction";
import { enumKeys } from "$lib/utils/enum.utils";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import {
  isTransactionNetworkBtc,
  mapNnsTransaction,
  mapToSelfTransaction,
  showTransactionFee,
  toUiTransaction,
  transactionDisplayAmount,
  transactionName,
  transactionType,
} from "$lib/utils/transactions.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import {
  mockReceivedFromMainAccountTransaction,
  mockSentToSubAccountTransaction,
} from "$tests/mocks/transaction.mock";
import { ICPToken, TokenAmount } from "@dfinity/utils";

describe("transactions-utils", () => {
  describe("showTransactionFee", () => {
    it("should be false for received transactions", () => {
      expect(
        showTransactionFee({
          type: AccountTransactionType.Send,
          isReceive: true,
        })
      ).toBe(false);
      expect(
        showTransactionFee({
          type: AccountTransactionType.Mint,
          isReceive: true,
        })
      ).toBe(false);
    });

    it("should be false for sent Mint and Burn", () => {
      expect(
        showTransactionFee({
          type: AccountTransactionType.Mint,
          isReceive: false,
        })
      ).toBe(false);
      expect(
        showTransactionFee({
          type: AccountTransactionType.Burn,
          isReceive: false,
        })
      ).toBe(false);
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
            fee: { e8s: BigInt(10000) },
            amount: { e8s: BigInt(110000000) },
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
            fee: { e8s: BigInt(10000) },
            amount: { e8s: BigInt(110000000) },
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

  describe("mapNnsTransaction", () => {
    it("should map Send transaction", () => {
      const { type, isReceive, isSend, from, to, displayAmount, date } =
        mapNnsTransaction({
          transaction: mockSentToSubAccountTransaction,
          account: mockMainAccount,
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const amount = (mockSentToSubAccountTransaction.transfer as any)?.Send
        ?.amount.e8s as bigint;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fee = (mockSentToSubAccountTransaction.transfer as any)?.Send?.fee
        .e8s as bigint;

      expect(type).toBe(
        transactionType({
          transaction: mockSentToSubAccountTransaction,
        })
      );
      expect(isReceive).toBe(false);
      expect(isSend).toBeTruthy();
      expect(from).toBe(mockMainAccount.identifier);
      expect(to).toBe(mockSubAccount.identifier);
      expect(displayAmount).toBe(
        transactionDisplayAmount({
          useFee: true,
          amount,
          fee,
        })
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
        mapNnsTransaction({
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
        transactionType({
          transaction: mockReceivedFromMainAccountTransaction,
        })
      );
      expect(isSend).toBe(false);
      expect(isReceive).toBeTruthy();
      expect(from).toBe(mockMainAccount.identifier);
      expect(to).toBe(mockSubAccount.identifier);
      expect(displayAmount).toBe(
        transactionDisplayAmount({
          useFee: false,
          amount,
          fee,
        })
      );
      expect(+date).toBe(
        Number(
          mockReceivedFromMainAccountTransaction.timestamp.timestamp_nanos /
            BigInt(1e6)
        )
      );
    });

    it("should support toSelfTransaction", () => {
      const { isReceive, isSend, displayAmount } = mapNnsTransaction({
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

      expect(displayAmount).toBe(
        transactionDisplayAmount({
          useFee: false,
          amount,
          fee,
        })
      );
      expect(isSend).toBe(false);
      expect(isReceive).toBeTruthy();
    });

    it("supports participate in swap transaction type", () => {
      const swapCanisterId = principal(0);
      const swapCanisterAccount = getSwapCanisterAccount({
        controller: mockMainAccount.principal,
        swapCanisterId,
      });
      const swapTransaction: NnsTransaction = {
        ...mockReceivedFromMainAccountTransaction,
        transfer: {
          Send: {
            fee: { e8s: BigInt(10000) },
            amount: { e8s: BigInt(110000000) },
            to: swapCanisterAccount.toHex(),
          },
        },
      };
      const { type } = mapNnsTransaction({
        transaction: swapTransaction,
        account: mockMainAccount,
        toSelfTransaction: false,
        swapCanisterAccounts: new Set([swapCanisterAccount.toHex()]),
      });
      expect(type).toBe(AccountTransactionType.ParticipateSwap);
    });

    it("supports swap refund transaction type", () => {
      const swapCanisterId = principal(0);
      const swapCanisterAccount = getSwapCanisterAccount({
        controller: mockMainAccount.principal,
        swapCanisterId,
      });
      const swapTransaction: NnsTransaction = {
        ...mockReceivedFromMainAccountTransaction,
        transfer: {
          Receive: {
            fee: { e8s: BigInt(10000) },
            amount: { e8s: BigInt(110000000) },
            from: swapCanisterAccount.toHex(),
          },
        },
      };
      const { type } = mapNnsTransaction({
        transaction: swapTransaction,
        account: mockMainAccount,
        toSelfTransaction: false,
        swapCanisterAccounts: new Set([swapCanisterAccount.toHex()]),
      });
      expect(type).toBe(AccountTransactionType.RefundSwap);
    });
  });

  describe("toUiTransaction", () => {
    const defaultDate = new Date("2021-01-01 00:00:00");
    const defaultAmount = 100_000_000n;
    const defaultFrom = "from-address";
    const defaultTo = "to-address";

    const defaultTransaction: Transaction = {
      type: AccountTransactionType.Send,
      isReceive: false,
      isSend: true,
      from: defaultFrom,
      to: defaultTo,
      displayAmount: defaultAmount,
      date: defaultDate,
    };

    const defaultParams = {
      transaction: defaultTransaction,
      toSelfTransaction: false,
      token: ICPToken,
      transactionNames: en.transaction_names,
    };

    const defaultExpectedUiTransaction: UiTransaction = {
      isIncoming: false,
      headline: "Sent",
      otherParty: defaultTo,
      tokenAmount: TokenAmount.fromE8s({
        amount: defaultAmount,
        token: ICPToken,
      }),
      timestamp: defaultDate,
    };

    it("should convert the default transaction", () => {
      expect(toUiTransaction(defaultParams)).toEqual(
        defaultExpectedUiTransaction
      );
    });

    it("should convert a sent transaction", () => {
      expect(
        toUiTransaction({
          ...defaultParams,
          transaction: {
            ...defaultTransaction,
            isSend: true,
            isReceive: false,
          },
        })
      ).toEqual({
        ...defaultExpectedUiTransaction,
        isIncoming: false,
        headline: "Sent",
        otherParty: defaultTo,
      });
    });

    it("should convert a received transaction", () => {
      expect(
        toUiTransaction({
          ...defaultParams,
          transaction: {
            ...defaultTransaction,
            isReceive: true,
            isSend: false,
          },
        })
      ).toEqual({
        ...defaultExpectedUiTransaction,
        isIncoming: true,
        headline: "Received",
        otherParty: defaultFrom,
      });
    });

    it("should convert an approve transaction", () => {
      expect(
        toUiTransaction({
          ...defaultParams,
          transaction: {
            ...defaultTransaction,
            type: AccountTransactionType.Approve,
            isSend: false,
            isReceive: false,
            from: undefined,
            to: undefined,
          },
        })
      ).toEqual({
        ...defaultExpectedUiTransaction,
        headline: "Approve transfer",
        otherParty: undefined,
      });
    });

    it("should use fallbackDescriptions", () => {
      expect(
        toUiTransaction({
          ...defaultParams,
          transaction: {
            ...defaultTransaction,
            type: AccountTransactionType.Burn,
            isSend: false,
            isReceive: false,
            from: undefined,
            to: undefined,
          },
          fallbackDescriptions: en.ckbtc_transaction_names as unknown as Record<
            string,
            string
          >,
        })
      ).toEqual({
        ...defaultExpectedUiTransaction,
        headline: "Sent",
        otherParty: undefined,
        fallbackDescription: 'To: <span class="value">BTC Network</span>',
      });
    });

    it("should convert a to-self transaction", () => {
      expect(
        toUiTransaction({
          ...defaultParams,
          toSelfTransaction: true,
        })
      ).toEqual({
        ...defaultExpectedUiTransaction,
        isIncoming: true,
        headline: "Received",
        otherParty: defaultFrom,
      });
    });

    it("should convert amount", () => {
      const amount = 728_000_000n;
      expect(
        toUiTransaction({
          ...defaultParams,
          transaction: {
            ...defaultTransaction,
            displayAmount: amount,
          },
        })
      ).toEqual({
        ...defaultExpectedUiTransaction,
        tokenAmount: TokenAmount.fromE8s({ amount, token: ICPToken }),
      });
    });

    it("should convert token", () => {
      expect(
        toUiTransaction({
          ...defaultParams,
          token: mockToken,
        })
      ).toEqual({
        ...defaultExpectedUiTransaction,
        tokenAmount: TokenAmount.fromE8s({
          amount: defaultAmount,
          token: mockToken,
        }),
      });
    });

    it("should convert timestamp", () => {
      const timestamp = new Date("2021-03-04 12:56:47");
      expect(
        toUiTransaction({
          ...defaultParams,
          transaction: {
            ...defaultTransaction,
            date: timestamp,
          },
        })
      ).toEqual({
        ...defaultExpectedUiTransaction,
        timestamp,
      });
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
      ).toBe(BigInt(222 + 333));
    });

    it("should calculate without fee", () => {
      expect(
        transactionDisplayAmount({
          useFee: false,
          amount: 222n,
          fee: 333n,
        })
      ).toBe(BigInt(222));
    });

    it("should throw when no fee", () => {
      expect(() =>
        transactionDisplayAmount({
          useFee: true,
          amount: BigInt(222),
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
});
