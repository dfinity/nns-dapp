/**
 * @jest-environment jsdom
 */

import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import * as nnsdappApi from "$lib/api/nns-dapp.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { getLedgerIdentityProxy } from "$lib/proxy/ledger.services.proxy";
import {
  addSubAccount,
  cancelPollAccounts,
  getAccountIdentity,
  getAccountIdentityByPrincipal,
  getAccountTransactions,
  getOrCreateAccount,
  initAccounts,
  loadAccounts,
  loadBalance,
  pollAccounts,
  renameSubAccount,
  syncAccounts,
  transferICP,
} from "$lib/services/accounts.services";
import { accountsStore } from "$lib/stores/accounts.store";
import * as toastsFunctions from "$lib/stores/toasts.store";
import type { NewTransaction } from "$lib/types/transaction";
import {
  mockAccountDetails,
  mockHardwareWalletAccount,
  mockHardwareWalletAccountDetails,
  mockMainAccount,
  mockSubAccount,
  mockSubAccountDetails,
} from "$tests/mocks/accounts.store.mock";
import {
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSentToSubAccountTransaction } from "$tests/mocks/transaction.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { get } from "svelte/store";

jest.mock("$lib/proxy/ledger.services.proxy", () => {
  return {
    getLedgerIdentityProxy: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockIdentity)),
  };
});

jest.mock("$lib/api/nns-dapp.api");
jest.mock("$lib/api/ledger.api");
const blockedApiPaths = ["$lib/api/nns-dapp.api", "$lib/api/ledger.api"];

describe("accounts-services", () => {
  blockAllCallsTo(blockedApiPaths);

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(jest.fn);
    jest.clearAllMocks();
    toastsStore.reset();
    accountsStore.reset();
  });

  describe("getOrCreateAccount", () => {
    it("should not call nnsdapp addAccount if getAccount already returns account", async () => {
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const addAccountSpy = jest.spyOn(nnsdappApi, "addAccount");

      await getOrCreateAccount({ identity: mockIdentity, certified: true });

      expect(queryAccountSpy).toBeCalledTimes(1);
      expect(addAccountSpy).not.toBeCalled();
    });

    it("should throw if getAccount fails with other error than AccountNotFoundError", async () => {
      const error = new Error("test");

      jest.spyOn(nnsdappApi, "queryAccount").mockRejectedValueOnce(error);
      const addAccountSpy = jest.spyOn(nnsdappApi, "addAccount");

      const call = () =>
        getOrCreateAccount({ identity: mockIdentity, certified: true });

      await expect(call).rejects.toThrowError(error);
      expect(addAccountSpy).not.toBeCalled();
    });

    it("should addAccount if queryAccount throws AccountNotFoundError", async () => {
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockRejectedValueOnce(new AccountNotFoundError("test"))
        .mockResolvedValue(mockAccountDetails);
      const addAccountSpy = jest
        .spyOn(nnsdappApi, "addAccount")
        .mockResolvedValue(undefined);

      await getOrCreateAccount({ identity: mockIdentity, certified: true });
      expect(addAccountSpy).toBeCalledTimes(1);
      expect(queryAccountSpy).toBeCalledTimes(2);
    });
  });

  describe("loadAccounts", () => {
    it("should call ledger and nnsdapp to get account and balance", async () => {
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(BigInt(0));
      const certified = true;
      await loadAccounts({ identity: mockIdentity, certified });

      expect(queryAccountSpy).toBeCalled();
      expect(queryAccountBalanceSpy).toBeCalledWith({
        identity: mockIdentity,
        certified,
        accountIdentifier: mockAccountDetails.account_identifier,
      });
    });

    it("should get balances of subaccounts", async () => {
      const accountDetails: AccountDetails = {
        ...mockAccountDetails,
        sub_accounts: [mockSubAccountDetails],
      };
      jest.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(accountDetails);
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(BigInt(0));

      const certified = true;
      await loadAccounts({ identity: mockIdentity, certified });

      // Called once for main, another for the subaccount
      expect(queryAccountBalanceSpy).toBeCalledWith({
        accountIdentifier: mockAccountDetails.account_identifier,
        certified,
        identity: mockIdentity,
      });
      expect(queryAccountBalanceSpy).toBeCalledWith({
        accountIdentifier: mockSubAccountDetails.account_identifier,
        certified,
        identity: mockIdentity,
      });
    });

    it("should get balances of hardware wallet accounts", async () => {
      const accountDetails: AccountDetails = {
        ...mockAccountDetails,
        hardware_wallet_accounts: [mockHardwareWalletAccountDetails],
      };
      jest.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(accountDetails);
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(BigInt(0));

      const certified = true;
      await loadAccounts({ identity: mockIdentity, certified });

      // Called once for main, another for the hardware wallet = 2
      expect(queryAccountBalanceSpy).toBeCalledWith({
        accountIdentifier: mockAccountDetails.account_identifier,
        certified,
        identity: mockIdentity,
      });
      expect(queryAccountBalanceSpy).toBeCalledWith({
        accountIdentifier: mockHardwareWalletAccountDetails.account_identifier,
        certified,
        identity: mockIdentity,
      });
    });
  });

  describe("initAccounts", () => {
    it("should sync accounts", async () => {
      const mainBalanceE8s = BigInt(10_000_000);
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const mockAccounts = {
        main: {
          ...mockMainAccount,
          balance: TokenAmount.fromE8s({
            amount: mainBalanceE8s,
            token: ICPToken,
          }),
        },
        subAccounts: [],
        hardwareWallets: [],
        certified: true,
      };
      await initAccounts();

      expect(queryAccountSpy).toHaveBeenCalledTimes(2);
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(2);

      const accounts = get(accountsStore);
      expect(accounts).toEqual(mockAccounts);
    });

    it("should not show toast errors", async () => {
      jest.spyOn(ledgerApi, "queryAccountBalance");
      jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockRejectedValue(new Error("test"));

      await initAccounts();

      const toastsData = get(toastsStore);
      expect(toastsData).toEqual([]);
    });
  });

  describe("syncAccounts", () => {
    it("should sync accounts", async () => {
      const mainBalanceE8s = BigInt(10_000_000);
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const mockAccounts = {
        main: {
          ...mockMainAccount,
          balance: TokenAmount.fromE8s({
            amount: mainBalanceE8s,
            token: ICPToken,
          }),
        },
        subAccounts: [],
        hardwareWallets: [],
        certified: true,
      };
      await syncAccounts();

      expect(queryAccountSpy).toHaveBeenCalledTimes(2);
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(2);

      const accounts = get(accountsStore);
      expect(accounts).toEqual(mockAccounts);
    });

    it("should show toast on error", async () => {
      const errorTest = "test";
      jest.spyOn(ledgerApi, "queryAccountBalance");
      jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockRejectedValue(new Error(errorTest));

      await syncAccounts();

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `${en.error.accounts_not_found} ${errorTest}`,
        },
      ]);
    });
  });

  describe("loadBalance", () => {
    it("should query account balance and load it in store", async () => {
      const newBalanceE8s = BigInt(10_000_000);
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(newBalanceE8s);
      accountsStore.set({
        main: mockMainAccount,
      });
      expect(get(accountsStore).main.balance).toEqual(mockMainAccount.balance);
      await loadBalance({ accountIdentifier: mockMainAccount.identifier });

      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockMainAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockMainAccount.identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(2);

      expect(get(accountsStore).main.balance.toE8s()).toEqual(newBalanceE8s);
    });

    it("should not show error if only query fails", async () => {
      const newBalanceE8s = BigInt(10_000_000);
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockImplementation(async (args) => {
          if (args.certified) {
            return newBalanceE8s;
          }
          throw new Error("test");
        });
      accountsStore.set({
        main: mockMainAccount,
      });
      await loadBalance({ accountIdentifier: mockMainAccount.identifier });

      expect(queryAccountBalanceSpy).toBeCalledTimes(2);
      expect(get(toastsStore)).toEqual([]);
    });

    it("should show error if call fails", async () => {
      const error = new Error("Test");
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockRejectedValue(error);
      accountsStore.set({
        main: mockMainAccount,
      });
      await loadBalance({ accountIdentifier: mockMainAccount.identifier });

      expect(queryAccountBalanceSpy).toBeCalledTimes(2);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(error.message),
      });
    });
  });

  describe("services", () => {
    const mainBalanceE8s = BigInt(10_000_000);

    let queryAccountBalanceSpy: jest.SpyInstance;
    let queryAccountSpy: jest.SpyInstance;
    let spyCreateSubAccount: jest.SpyInstance;
    beforeEach(() => {
      queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      spyCreateSubAccount = jest
        .spyOn(accountsApi, "createSubAccount")
        .mockResolvedValue(undefined);
    });

    it("should sync accounts", async () => {
      const mockAccounts = {
        main: {
          ...mockMainAccount,
          balance: TokenAmount.fromE8s({
            amount: mainBalanceE8s,
            token: ICPToken,
          }),
        },
        subAccounts: [],
        hardwareWallets: [],
        certified: true,
      };
      await syncAccounts();

      expect(queryAccountSpy).toHaveBeenCalledTimes(2);
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(2);

      const accounts = get(accountsStore);
      expect(accounts).toEqual(mockAccounts);
    });

    it("should add a subaccount", async () => {
      await addSubAccount({ name: "test subaccount" });

      expect(spyCreateSubAccount).toHaveBeenCalled();
    });

    it("should not sync accounts if no identity", async () => {
      setNoIdentity();

      const call = async () => await syncAccounts();

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

      resetIdentity();
    });

    it("should not add subaccount if no identity", async () => {
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      setNoIdentity();

      await addSubAccount({ name: "test subaccount" });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error__account.create_subaccount",
        err: new Error(en.error.missing_identity),
      });

      resetIdentity();
    });
  });

  describe("transferICP", () => {
    const mainBalanceE8s = BigInt(10_000_000);
    const sourceAccount = mockMainAccount;
    const transferICPParams: NewTransaction = {
      sourceAccount,
      destinationAddress: mockSubAccount.identifier,
      amount: 1,
    };
    let queryAccountBalanceSpy: jest.SpyInstance;
    let spySendICP: jest.SpyInstance;
    beforeEach(() => {
      queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      spySendICP = jest
        .spyOn(ledgerApi, "sendICP")
        .mockResolvedValue(BigInt(20));
    });

    it("should transfer ICP", async () => {
      await transferICP(transferICPParams);

      expect(spySendICP).toHaveBeenCalled();
    });

    it("should sync balances after transfer ICP", async () => {
      await transferICP(transferICPParams);

      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: sourceAccount.identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: sourceAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledTimes(2);
    });

    it("should sync destination balances after transfer ICP to own account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      await transferICP({
        ...transferICPParams,
        destinationAddress: mockSubAccount.identifier,
      });

      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockSubAccount.identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockSubAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: sourceAccount.identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: sourceAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe("rename", () => {
    let queryAccountBalanceSpy: jest.SpyInstance;
    let queryAccountSpy: jest.SpyInstance;
    let spyRenameSubAccount: jest.SpyInstance;
    beforeEach(() => {
      queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(BigInt(0));
      queryAccountSpy = jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      spyRenameSubAccount = jest
        .spyOn(accountsApi, "renameSubAccount")
        .mockImplementation(() => Promise.resolve());
    });

    it("should rename a subaccount", async () => {
      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(spyRenameSubAccount).toHaveBeenCalled();
    });

    it("should sync accounts after rename", async () => {
      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(queryAccountSpy).toHaveBeenCalled();
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
    });

    it("should not rename subaccount if no identity", async () => {
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      setNoIdentity();

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount",
        err: new Error(en.error.missing_identity),
      });

      resetIdentity();

      spyToastError.mockClear();
    });

    it("should not rename subaccount if no selected account", async () => {
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: undefined,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount_no_account",
      });

      spyToastError.mockClear();
    });

    it("should not rename subaccount if type is not subaccount", async () => {
      const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockMainAccount,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount_type",
      });

      spyToastError.mockClear();
    });
  });

  describe("getAccountTransactions", () => {
    const onLoad = jest.fn();
    const mockResponse = [mockSentToSubAccountTransaction];
    let spyGetTransactions;

    beforeEach(() => {
      jest.clearAllMocks();
      spyGetTransactions = jest
        .spyOn(accountsApi, "getTransactions")
        .mockImplementation(() => Promise.resolve(mockResponse));
    });

    it("should call getTransactions", async () => {
      await getAccountTransactions({
        accountIdentifier: "",
        onLoad,
      });
      expect(spyGetTransactions).toBeCalled();
      expect(spyGetTransactions).toBeCalledTimes(2);
    });

    it("should call onLoad", async () => {
      await getAccountTransactions({
        accountIdentifier: "",
        onLoad,
      });
      expect(onLoad).toBeCalled();
      expect(onLoad).toBeCalledTimes(2);
      expect(onLoad).toBeCalledWith({
        accountIdentifier: "",
        transactions: mockResponse,
      });
    });

    describe("getAccountTransactions errors", () => {
      beforeEach(() => {
        spyGetTransactions = jest
          .spyOn(accountsApi, "getTransactions")
          .mockImplementation(async () => {
            throw new Error("test");
          });
      });

      it("should display toast error", async () => {
        const spyToastError = jest.spyOn(toastsFunctions, "toastsError");

        await getAccountTransactions({
          accountIdentifier: "",
          onLoad,
        });

        expect(spyToastError).toBeCalledTimes(1);
        expect(spyToastError).toBeCalledWith({
          labelKey: "error.transactions_not_found",
          err: new Error("test"),
        });
        expect(onLoad).not.toBeCalled();
      });
    });
  });

  describe("getAccountIdentity", () => {
    it("returns user identity if main account", async () => {
      accountsStore.set({
        main: mockMainAccount,
      });
      const expectedIdentity = await getAccountIdentity(
        mockMainAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
      accountsStore.reset();
    });

    it("returns user identity if main account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      const expectedIdentity = await getAccountIdentity(
        mockMainAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
      accountsStore.reset();
    });

    it("returns calls for hardware walleet identity if hardware wallet account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentity(
        mockHardwareWalletAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
      expect(getLedgerIdentityProxy).toBeCalled();
      accountsStore.reset();
    });
  });

  describe("getAccountIdentityByPrincipal", () => {
    it("returns user identity if main account", async () => {
      accountsStore.set({
        main: mockMainAccount,
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        mockMainAccount.principal?.toText() as string
      );
      expect(expectedIdentity).toBe(mockIdentity);
      accountsStore.reset();
    });

    it("returns calls for hardware walleet identity if hardware wallet account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        mockHardwareWalletAccount.principal?.toText() as string
      );
      expect(expectedIdentity).toBe(mockIdentity);
      expect(getLedgerIdentityProxy).toBeCalled();
      accountsStore.reset();
    });

    it("returns null if no main account nor hardware wallet account", async () => {
      accountsStore.set({
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        "gje2w-p7x7x-yuy72-bllam-x2itq-znokr-jnvf6-5dzn4-45jiy-5wvbo-uqe"
      );
      expect(expectedIdentity).toBeUndefined();
      accountsStore.reset();
    });
  });

  describe("pollAccounts", () => {
    const mainBalanceE8s = BigInt(10_000_000);
    const mockAccounts = {
      main: {
        ...mockMainAccount,
        balance: TokenAmount.fromE8s({
          amount: mainBalanceE8s,
          token: ICPToken,
        }),
      },
      subAccounts: [],
      hardwareWallets: [],
      certified: true,
    };

    beforeEach(() => {
      accountsStore.reset();
      jest.clearAllTimers();
      jest.clearAllMocks();
      cancelPollAccounts();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
    });

    it("calls apis and sets accountsStore", async () => {
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);

      await pollAccounts();

      expect(queryAccountSpy).toHaveBeenCalledTimes(1);
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(1);

      const accounts = get(accountsStore);
      expect(accounts).toEqual(mockAccounts);
    });

    it("calls apis with certified param used", async () => {
      const queryAccountBalanceSpy = jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);

      await pollAccounts(false);

      expect(queryAccountSpy).toHaveBeenCalledTimes(1);
      expect(queryAccountSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        accountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
    });

    it("polls if queryAccount fails", async () => {
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const callsUntilSuccess = 4;
      const error = new Error("test");
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue(mockAccountDetails);

      pollAccounts();

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(queryAccountSpy).toBeCalledTimes(expectedCalls);

      let retryDelay = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
      while (expectedCalls < callsUntilSuccess) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(queryAccountSpy).toBeCalledTimes(expectedCalls);
      }

      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(queryAccountSpy).toBeCalledTimes(expectedCalls);

      const accounts = get(accountsStore);
      return expect(accounts).toEqual(mockAccounts);
    });

    it("stops polling when cancelPollAccounts is called", async () => {
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const error = new Error("test");
      const queryAccountSpy = jest
        .spyOn(nnsdappApi, "queryAccount")
        .mockRejectedValue(error);

      pollAccounts();

      await runResolvedPromises();
      let expectedCalls = 1;
      expect(queryAccountSpy).toBeCalledTimes(expectedCalls);

      let retryDelay = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
      const callsBeforeCancelPolling = 3;
      while (expectedCalls < callsBeforeCancelPolling) {
        await advanceTime(retryDelay);
        retryDelay *= 2;
        expectedCalls += 1;
        expect(queryAccountSpy).toBeCalledTimes(expectedCalls);
      }
      cancelPollAccounts();

      // Even after waiting a long time there shouldn't be more calls.
      await advanceTime(99 * retryDelay);
      expect(queryAccountSpy).toBeCalledTimes(expectedCalls);
    });
  });
});
