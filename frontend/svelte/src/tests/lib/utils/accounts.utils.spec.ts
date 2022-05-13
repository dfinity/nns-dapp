import { ICP } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type { Transaction } from "../../../lib/canisters/nns-dapp/nns-dapp.types";
import { ACCOUNT_ADDRESS_MIN_LENGTH } from "../../../lib/constants/accounts.constants";
import {
  AccountTransactionType,
  emptyAddress,
  getAccountByPrincipal,
  getPrincipalFromString,
  invalidAddress,
  isHardwareWallet,
  mapTransaction,
  showTransactionFee,
  transactionDisplayAmount,
  transactionType,
} from "../../../lib/utils/accounts.utils";
import {
  mockAddressInput,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import {
  mockReceivedFromMainAccountTransaction,
  mockSentToSubAccountTransaction,
} from "../../mocks/transaction.mock";

describe("accounts-utils", () => {
  describe("getAccountByPrincipal", () => {
    it("returns main account when principal matches", () => {
      const accounts = {
        main: mockMainAccount,
        subAccounts: undefined,
      };

      const found = getAccountByPrincipal({
        accounts,
        principal: mockMainAccount.principal?.toText() as string,
      });
      expect(found).toBe(mockMainAccount);
    });

    it("returns undefined if it doesn't match", () => {
      const accounts = {
        main: mockMainAccount,
        subAccounts: undefined,
      };

      const found = getAccountByPrincipal({
        accounts,
        principal: "bbbbb-aa",
      });
      expect(found).toBeUndefined();
    });
  });

  describe("invalidAddress", () => {
    it("should be a invalid address", () => {
      expect(invalidAddress(undefined)).toBeTruthy();
      expect(invalidAddress("test")).toBeTruthy();

      expect(
        invalidAddress(mockAddressInput(ACCOUNT_ADDRESS_MIN_LENGTH - 1))
      ).toBeTruthy();
    });

    it("should be a valid address", () => {
      expect(
        invalidAddress(mockAddressInput(ACCOUNT_ADDRESS_MIN_LENGTH))
      ).toBeFalsy();
      expect(
        invalidAddress(mockAddressInput(ACCOUNT_ADDRESS_MIN_LENGTH + 1))
      ).toBeFalsy();
    });
  });

  describe("emptyAddress", () => {
    it("should be an empty address", () => {
      expect(emptyAddress(undefined)).toBeTruthy();
      expect(emptyAddress("")).toBeTruthy();
    });

    it("should not be an empty address", () => {
      expect(emptyAddress("test")).toBeFalsy();
    });
  });

  describe("getPrincipalFromString", () => {
    it("returns undefined when invalid address", () => {
      expect(getPrincipalFromString("aa")).toBeUndefined();
      expect(getPrincipalFromString("aaasfdadaasdf")).toBeUndefined();
    });

    it("returns principal when valid address", () => {
      expect(getPrincipalFromString("aaaaa-aa")).toBeInstanceOf(Principal);
      expect(
        getPrincipalFromString(
          "djzvl-qx6kb-xyrob-rl5ki-elr7y-ywu43-l54d7-ukgzw-qadse-j6oml-5qe"
        )
      ).toBeInstanceOf(Principal);
    });
  });

  describe("isHardwareWallet", () => {
    it("returns true if type hardware wallet", () => {
      expect(isHardwareWallet(mockHardwareWalletAccount)).toBeTruthy();
    });

    it("returns false if type no hardware wallet", () => {
      expect(isHardwareWallet(mockMainAccount)).toBeFalsy();
      expect(isHardwareWallet(mockSubAccount)).toBeFalsy();
    });

    it("returns false if no account", () => {
      expect(isHardwareWallet(undefined)).toBeFalsy();
    });
  });

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
          type,
          isReceive,
          amount: ICP.fromE8s(amount),
          fee: ICP.fromE8s(fee),
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
          type,
          isReceive,
          amount: ICP.fromE8s(amount),
          fee: ICP.fromE8s(fee),
        }).toE8s()
      );
      expect(+date).toBe(
        Number(
          mockReceivedFromMainAccountTransaction.timestamp.timestamp_nanos /
            BigInt(1e6)
        )
      );
    });
  });
});
