import {
  createSubAccount,
  getTransactions,
  loadAccounts,
  renameSubAccount,
} from "$lib/api/accounts.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type {
  AccountDetails,
  GetTransactionsResponse,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { AccountIdentifier, LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import {
  mockAccountDetails,
  mockHardwareWalletAccountDetails,
  mockSubAccount,
  mockSubAccountDetails,
} from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockSentToSubAccountTransaction } from "../../mocks/transaction.mock";

describe("accounts-api", () => {
  afterAll(() => jest.clearAllMocks());

  describe("loadAccounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("should call ledger and nnsdapp to get account and balance", async () => {
      // Ledger mock
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.accountBalance.mockResolvedValue(BigInt(100_000_000));
      jest.spyOn(LedgerCanister, "create").mockReturnValue(ledgerMock);

      // NNSDapp mock
      const nnsDappMock = mock<NNSDappCanister>();
      nnsDappMock.getAccount
        .mockRejectedValueOnce(new AccountNotFoundError("test"))
        .mockResolvedValue(mockAccountDetails);
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      await loadAccounts({ identity: mockIdentity, certified: true });

      expect(ledgerMock.accountBalance).toBeCalled();
      expect(nnsDappMock.getAccount).toBeCalledTimes(2);
      expect(nnsDappMock.addAccount).toBeCalledTimes(1);
    });

    it("should not call nnsdapp addAccount if getAccount already returns account", async () => {
      // Ledger mock
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.accountBalance.mockResolvedValue(BigInt(100_000_000));
      jest.spyOn(LedgerCanister, "create").mockReturnValue(ledgerMock);

      // NNSDapp mock
      const nnsDappMock = mock<NNSDappCanister>();
      nnsDappMock.getAccount.mockResolvedValue(mockAccountDetails);
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      await loadAccounts({ identity: mockIdentity, certified: true });

      expect(ledgerMock.accountBalance).toBeCalled();
      expect(nnsDappMock.getAccount).toBeCalledTimes(1);
      expect(nnsDappMock.addAccount).not.toBeCalled();
    });

    it("should throw if getAccount fails with other error than AccountNotFoundError", async () => {
      // Ledger mock
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.accountBalance.mockResolvedValue(BigInt(100_000_000));
      jest.spyOn(LedgerCanister, "create").mockReturnValue(ledgerMock);

      // NNSDapp mock
      const error = new Error("test");
      const nnsDappMock = mock<NNSDappCanister>();
      nnsDappMock.getAccount
        .mockRejectedValueOnce(error)
        .mockResolvedValue(mockAccountDetails);
      nnsDappMock.addAccount.mockResolvedValue(undefined);
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      const call = () =>
        loadAccounts({ identity: mockIdentity, certified: true });

      await expect(call).rejects.toThrowError(error);
      expect(ledgerMock.accountBalance).not.toBeCalled();
      expect(nnsDappMock.addAccount).not.toBeCalled();
    });

    it("should throw if getAccount fails after addAccount", async () => {
      // Ledger mock
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.accountBalance.mockResolvedValue(BigInt(100_000_000));
      jest.spyOn(LedgerCanister, "create").mockReturnValue(ledgerMock);

      // NNSDapp mock
      const nnsDappMock = mock<NNSDappCanister>();
      nnsDappMock.getAccount
        .mockRejectedValueOnce(new AccountNotFoundError("test"))
        .mockRejectedValue(new Error("test"));
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      const call = () =>
        loadAccounts({ identity: mockIdentity, certified: true });

      await expect(call).rejects.toThrow();
      expect(ledgerMock.accountBalance).not.toBeCalled();
      expect(nnsDappMock.addAccount).toBeCalled();
    });

    it("should get balances of subaccounts", async () => {
      // Ledger mock
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.accountBalance.mockResolvedValue(BigInt(100_000_000));
      jest.spyOn(LedgerCanister, "create").mockReturnValue(ledgerMock);

      // NNSDapp mock
      const nnsDappMock = mock<NNSDappCanister>();
      const accountDetails: AccountDetails = {
        ...mockAccountDetails,
        sub_accounts: [mockSubAccountDetails],
      };
      nnsDappMock.getAccount.mockResolvedValue(accountDetails);
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      await loadAccounts({ identity: mockIdentity, certified: true });

      // Called once for main, another for the subaccount
      expect(ledgerMock.accountBalance).toBeCalledWith({
        accountIdentifier: AccountIdentifier.fromHex(
          mockAccountDetails.account_identifier
        ),
        certified: true,
      });
      expect(ledgerMock.accountBalance).toBeCalledWith({
        accountIdentifier: AccountIdentifier.fromHex(
          mockSubAccountDetails.account_identifier
        ),
        certified: true,
      });
    });

    it("should get balances of hardware wallet accounts", async () => {
      // Ledger mock
      const ledgerMock = mock<LedgerCanister>();
      ledgerMock.accountBalance.mockResolvedValue(BigInt(100_000_000));
      jest.spyOn(LedgerCanister, "create").mockReturnValue(ledgerMock);

      // NNSDapp mock
      const nnsDappMock = mock<NNSDappCanister>();
      const accountDetails: AccountDetails = {
        ...mockAccountDetails,
        hardware_wallet_accounts: [mockHardwareWalletAccountDetails],
      };
      nnsDappMock.getAccount.mockResolvedValue(accountDetails);
      jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

      await loadAccounts({ identity: mockIdentity, certified: true });

      // Called once for main, another for the hardware wallet = 2
      expect(ledgerMock.accountBalance).toBeCalledWith({
        accountIdentifier: AccountIdentifier.fromHex(
          mockAccountDetails.account_identifier
        ),
        certified: true,
      });
      expect(ledgerMock.accountBalance).toBeCalledWith({
        accountIdentifier: AccountIdentifier.fromHex(
          mockHardwareWalletAccountDetails.account_identifier
        ),
        certified: true,
      });
    });
  });

  it("should call nnsDappCanister to create subaccount", async () => {
    const nnsDappMock = mock<NNSDappCanister>();
    jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

    await createSubAccount({ name: "test subaccount", identity: mockIdentity });

    expect(nnsDappMock.createSubAccount).toBeCalled();
  });

  it("should call nnsDappCanister to rename subaccount", async () => {
    const nnsDappMock = mock<NNSDappCanister>();
    jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

    await renameSubAccount({
      newName: "test subaccount",
      subAccountIdentifier: mockSubAccount.identifier,
      identity: mockIdentity,
    });

    expect(nnsDappMock.renameSubAccount).toBeCalled();
  });

  it("should call ledger and nnsdapp to get account and balance", async () => {
    // NNSDapp mock
    const mockResponse: GetTransactionsResponse = {
      total: 1,
      transactions: [mockSentToSubAccountTransaction],
    };
    const nnsDappMock = mock<NNSDappCanister>();
    nnsDappMock.getTransactions.mockResolvedValue(mockResponse);
    jest.spyOn(NNSDappCanister, "create").mockReturnValue(nnsDappMock);

    const response = await getTransactions({
      identity: mockIdentity,
      certified: true,
      accountIdentifier: "",
      pageSize: 1,
      offset: 0,
    });

    expect(nnsDappMock.getTransactions).toBeCalled();
    expect(nnsDappMock.getTransactions).toBeCalledTimes(1);
    expect(response).toEqual([mockSentToSubAccountTransaction]);
  });
});
