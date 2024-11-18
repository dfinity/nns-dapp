import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import * as nnsdappApi from "$lib/api/nns-dapp.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { mainTransactionFeeE8sStore } from "$lib/derived/main-transaction-fee.derived";
import * as icpLedgerServicesProxy from "$lib/proxy/icp-ledger.services.proxy";
import { getLedgerIdentityProxy } from "$lib/proxy/icp-ledger.services.proxy";
import * as authServices from "$lib/services/auth.services";
import {
  addSubAccount,
  cancelPollAccounts,
  getAccountIdentity,
  getAccountIdentityByPrincipal,
  getOrCreateAccount,
  initAccounts,
  loadBalance,
  pollAccounts,
  renameSubAccount,
  syncAccounts,
  transferICP,
} from "$lib/services/icp-accounts.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountBalancesStore } from "$lib/stores/icp-account-balances.store";
import { icpAccountDetailsStore } from "$lib/stores/icp-account-details.store";
import type { Account } from "$lib/types/account";
import type { NewTransaction } from "$lib/types/transaction";
import { toIcpAccountIdentifier } from "$lib/utils/accounts.utils";
import {
  mockGetIdentity,
  mockIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountDetails,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
  mockSubAccountDetails,
} from "$tests/mocks/icp-accounts.store.mock";
import { MockLedgerIdentity } from "$tests/mocks/ledger.identity.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import {
  AccountIdentifier,
  TxCreatedInFutureError,
  TxTooOldError,
} from "@dfinity/ledger-icp";
import { decodeIcrcAccount } from "@dfinity/ledger-icrc";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { get } from "svelte/store";
import type { MockInstance } from "vitest";

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/icp-ledger.api");
const blockedApiPaths = ["$lib/api/nns-dapp.api", "$lib/api/icp-ledger.api"];

describe("icp-accounts.services", () => {
  const mockLedgerIdentity = new MockLedgerIdentity();

  blockAllCallsTo(blockedApiPaths);

  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue();
    toastsStore.reset();
    resetAccountsForTesting();
    overrideFeatureFlagsStore.reset();
    resetIdentity();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
    vi.spyOn(
      icpLedgerServicesProxy,
      "getLedgerIdentityProxy"
    ).mockResolvedValue(mockLedgerIdentity);
  });

  const mockSnsAccountIcpAccountIdentifier = AccountIdentifier.fromPrincipal({
    principal: mockSnsMainAccount.principal,
  }).toHex();

  describe("getOrCreateAccount", () => {
    it("should not call nnsdapp addAccount if getAccount already returns account", async () => {
      const queryAccountSpy = vi
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const addAccountSpy = vi.spyOn(nnsdappApi, "addAccount");

      await getOrCreateAccount({ identity: mockIdentity, certified: true });

      expect(queryAccountSpy).toBeCalledTimes(1);
      expect(addAccountSpy).not.toBeCalled();
    });

    it("should throw if getAccount fails with other error than AccountNotFoundError", async () => {
      const error = new Error("test");

      vi.spyOn(nnsdappApi, "queryAccount").mockRejectedValueOnce(error);
      const addAccountSpy = vi.spyOn(nnsdappApi, "addAccount");

      const call = () =>
        getOrCreateAccount({ identity: mockIdentity, certified: true });

      await expect(call).rejects.toThrowError(error);
      expect(addAccountSpy).not.toBeCalled();
    });

    it("should addAccount if queryAccount throws AccountNotFoundError", async () => {
      const queryAccountSpy = vi
        .spyOn(nnsdappApi, "queryAccount")
        .mockRejectedValueOnce(new AccountNotFoundError("test"))
        .mockResolvedValue(mockAccountDetails);
      const addAccountSpy = vi
        .spyOn(nnsdappApi, "addAccount")
        .mockResolvedValue(undefined);

      await getOrCreateAccount({ identity: mockIdentity, certified: true });
      expect(addAccountSpy).toBeCalledTimes(1);
      expect(queryAccountSpy).toBeCalledTimes(2);
    });
  });

  describe("initAccounts", () => {
    it("should sync accounts", async () => {
      const mainBalanceE8s = 10_000_000n;
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const queryAccountSpy = vi
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const mockAccounts = {
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: [],
        hardwareWallets: [],
      };
      await initAccounts();

      expect(queryAccountSpy).toHaveBeenCalledTimes(2);
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(2);

      const accounts = get(icpAccountsStore);
      expect(accounts).toEqual(mockAccounts);
      expect(get(icpAccountDetailsStore)).toEqual({
        accountDetails: mockAccountDetails,
        certified: true,
      });
      expect(get(icpAccountBalancesStore)).toEqual({
        [mockAccountDetails.account_identifier]: {
          balanceE8s: mainBalanceE8s,
          certified: true,
        },
      });
    });

    it("should not show toast errors", async () => {
      vi.spyOn(ledgerApi, "queryAccountBalance");
      vi.spyOn(nnsdappApi, "queryAccount").mockRejectedValue(new Error("test"));

      await initAccounts();

      const toastsData = get(toastsStore);
      expect(toastsData).toEqual([]);
    });
  });

  describe("syncAccounts", () => {
    it("should sync accounts", async () => {
      const mainBalanceE8s = 10_000_000n;
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const queryAccountSpy = vi
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const mockAccounts = {
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: [],
        hardwareWallets: [],
      };
      await syncAccounts();

      expect(queryAccountSpy).toHaveBeenCalledTimes(2);
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(2);

      const accounts = get(icpAccountsStore);
      expect(accounts).toEqual(mockAccounts);
      expect(get(icpAccountDetailsStore)).toEqual({
        accountDetails: mockAccountDetails,
        certified: true,
      });
      expect(get(icpAccountBalancesStore)).toEqual({
        [mockAccountDetails.account_identifier]: {
          balanceE8s: mainBalanceE8s,
          certified: true,
        },
      });
    });

    it("should show toast on error", async () => {
      const errorTest = "test";
      vi.spyOn(ledgerApi, "queryAccountBalance");
      vi.spyOn(nnsdappApi, "queryAccount").mockRejectedValue(
        new Error(errorTest)
      );

      await syncAccounts();

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: `${en.error.accounts_not_found} ${errorTest}`,
        },
      ]);
    });

    it("update response replaces query response", async () => {
      const queryMainBalanceE8s = 10_000_000n;
      const updateMainBalanceE8s = 20_000_000n;
      const queryBalanceResponse = Promise.resolve(queryMainBalanceE8s);
      let resolveUpdateResponse;
      const updateBalanceResponse = new Promise<bigint>((resolve) => {
        resolveUpdateResponse = () => resolve(updateMainBalanceE8s);
      });

      vi.spyOn(ledgerApi, "queryAccountBalance").mockImplementation(
        ({ certified }) =>
          certified ? updateBalanceResponse : queryBalanceResponse
      );
      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
      const accountsWith = ({
        mainBalanceE8s,
      }: {
        mainBalanceE8s: bigint;
      }) => ({
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: [],
        hardwareWallets: [],
      });
      await syncAccounts();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: queryMainBalanceE8s })
      );

      resolveUpdateResponse();
      await runResolvedPromises();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: updateMainBalanceE8s })
      );
    });

    it("old update response does not replace newer response", async () => {
      const queryMainBalanceE8s = 10_000_000n;
      const updateMainBalanceE8s = 20_000_000n;
      const queryBalanceResponse = Promise.resolve(queryMainBalanceE8s);
      let resolveBalanceUpdateResponse;
      const updateBalanceResponse = new Promise<bigint>((resolve) => {
        resolveBalanceUpdateResponse = () => resolve(updateMainBalanceE8s);
      });

      const oldAccountDetails: AccountDetails = {
        ...mockAccountDetails,
        sub_accounts: [],
      };
      const newAccountDetails: AccountDetails = {
        ...mockAccountDetails,
        sub_accounts: [mockSubAccountDetails],
      };
      const queryAccountResponse = Promise.resolve(oldAccountDetails);
      let resolveAccountUpdateResponse;
      const updateAccountResponse = new Promise<AccountDetails>((resolve) => {
        resolveAccountUpdateResponse = () => resolve(oldAccountDetails);
      });

      vi.spyOn(ledgerApi, "queryAccountBalance").mockImplementation(
        ({ certified }) =>
          certified ? updateBalanceResponse : queryBalanceResponse
      );
      vi.spyOn(nnsdappApi, "queryAccount").mockImplementation(
        ({ certified }) =>
          certified ? updateAccountResponse : queryAccountResponse
      );
      const accountsWith = ({
        mainBalanceE8s,
        subAccounts,
      }: {
        mainBalanceE8s: bigint;
        subAccounts?: Account[];
      }) => ({
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: subAccounts ?? [],
        hardwareWallets: [],
      });
      await syncAccounts();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: queryMainBalanceE8s })
      );

      const newerMainBalanceE8s = 30_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        newerMainBalanceE8s
      );
      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(newAccountDetails);
      await syncAccounts();
      await runResolvedPromises();

      const expectedAccountsStoreContent = accountsWith({
        mainBalanceE8s: newerMainBalanceE8s,
        subAccounts: [
          {
            ...mockSubAccount,
            balanceUlps: newerMainBalanceE8s,
            name: mockSubAccountDetails.name,
            subAccount: mockSubAccountDetails.sub_account,
          },
        ],
      });
      expect(get(icpAccountsStore)).toEqual(expectedAccountsStoreContent);

      resolveBalanceUpdateResponse();
      resolveAccountUpdateResponse();
      await runResolvedPromises();

      expect(get(icpAccountsStore)).toEqual(expectedAccountsStoreContent);
    });
  });

  describe("loadBalance", () => {
    it("should query account balance and load it in store", async () => {
      const newBalanceE8s = 10_000_000n;
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(newBalanceE8s);
      setAccountsForTesting({
        main: mockMainAccount,
      });
      expect(get(icpAccountsStore).main.balanceUlps).toEqual(
        mockMainAccount.balanceUlps
      );
      await loadBalance({ accountIdentifier: mockMainAccount.identifier });

      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockMainAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockMainAccount.identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(2);

      expect(get(icpAccountsStore).main.balanceUlps).toEqual(newBalanceE8s);
    });

    it("should not show error if only query fails", async () => {
      const newBalanceE8s = 10_000_000n;
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockImplementation(async (args) => {
          if (args.certified) {
            return newBalanceE8s;
          }
          throw new Error("test");
        });
      setAccountsForTesting({
        main: mockMainAccount,
      });
      await loadBalance({ accountIdentifier: mockMainAccount.identifier });

      expect(queryAccountBalanceSpy).toBeCalledTimes(2);
      expect(get(toastsStore)).toEqual([]);
    });

    it("should show error if call fails", async () => {
      const error = new Error("Test");
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockRejectedValue(error);
      setAccountsForTesting({
        main: mockMainAccount,
      });
      await loadBalance({ accountIdentifier: mockMainAccount.identifier });

      expect(queryAccountBalanceSpy).toBeCalledTimes(2);
      expect(get(toastsStore)[0]).toMatchObject({
        level: "error",
        text: expect.stringContaining(error.message),
      });
    });

    it("old update response does not replace newer response", async () => {
      const queryMainBalanceE8s = 10_000_000n;
      const updateMainBalanceE8s = 20_000_000n;
      const queryBalanceResponse = Promise.resolve(queryMainBalanceE8s);
      let resolveUpdateResponse;
      const updateBalanceResponse = new Promise<bigint>((resolve) => {
        resolveUpdateResponse = () => resolve(updateMainBalanceE8s);
      });

      vi.spyOn(ledgerApi, "queryAccountBalance").mockImplementation(
        ({ certified }) =>
          certified ? updateBalanceResponse : queryBalanceResponse
      );
      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
      const accountsWith = ({
        mainBalanceE8s,
      }: {
        mainBalanceE8s: bigint;
      }) => ({
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: [],
        hardwareWallets: [],
      });
      await syncAccounts();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: queryMainBalanceE8s })
      );

      const newerMainBalanceE8s = 30_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        newerMainBalanceE8s
      );
      await loadBalance({ accountIdentifier: mockMainAccount.identifier });
      await runResolvedPromises();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: newerMainBalanceE8s })
      );

      resolveUpdateResponse();
      await runResolvedPromises();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: newerMainBalanceE8s })
      );
    });

    it("should query account balance for Icrc address", async () => {
      const newBalanceE8s = 10_000_000n;
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(newBalanceE8s);

      await loadBalance({ accountIdentifier: mockSnsMainAccount.identifier });

      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockSnsAccountIcpAccountIdentifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockSnsAccountIcpAccountIdentifier,
        certified: false,
      });
    });
  });

  describe("services", () => {
    const mainBalanceE8s = 10_000_000n;

    let spyCreateSubAccount: MockInstance;
    beforeEach(() => {
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
      spyCreateSubAccount = vi
        .spyOn(accountsApi, "createSubAccount")
        .mockResolvedValue(undefined);
    });

    it("should add a subaccount", async () => {
      await addSubAccount({
        name: "test subaccount",
      });

      expect(spyCreateSubAccount).toHaveBeenCalled();
    });

    it("should not sync accounts if no identity", async () => {
      setNoIdentity();

      const call = async () => await syncAccounts();

      await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

      resetIdentity();
    });

    it("should not add subaccount if no identity", async () => {
      setNoIdentity();

      expect(get(toastsStore)).toEqual([]);

      await addSubAccount({
        name: "test subaccount",
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, there was an unexpected error when creating your linked account, please try again. The operation cannot be executed without any identity.",
        },
      ]);
      resetIdentity();
    });
  });

  describe("transferICP", () => {
    const mainBalanceE8s = 10_000_000n;
    const sourceAccount = mockMainAccount;
    const transferICPParams: NewTransaction = {
      sourceAccount,
      destinationAddress: mockSubAccount.identifier,
      amount: 1,
    };
    let queryAccountBalanceSpy: MockInstance;
    let spySendICP: MockInstance;
    beforeEach(() => {
      queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      spySendICP = vi.spyOn(ledgerApi, "sendICP").mockResolvedValue(20n);
    });

    it("should transfer ICP", async () => {
      await transferICP(transferICPParams);

      expect(spySendICP).toHaveBeenCalled();

      expect(get(toastsStore)).toEqual([]);
    });

    it("should not transfer ICP for invalid address", async () => {
      const spy = vi.spyOn(icrcLedgerApi, "icrcTransfer").mockResolvedValue(1n);

      const result = await transferICP({
        ...transferICPParams,
        destinationAddress: "test",
      });

      expect(spySendICP).not.toHaveBeenCalled();
      expect(spy).not.toHaveBeenCalled();

      expect(result.success).toBeFalsy();
    });

    it("should transfer ICP using an Icrc destination address", async () => {
      const spy = vi.spyOn(ledgerApi, "sendIcpIcrc1").mockResolvedValue(1n);

      await transferICP({
        ...transferICPParams,
        destinationAddress: mockSnsMainAccount.identifier,
      });

      expect(spySendICP).not.toHaveBeenCalled();

      const feeE8s = get(mainTransactionFeeE8sStore);

      expect(spy).toHaveBeenCalledWith({
        amount: TokenAmount.fromNumber({
          amount: transferICPParams.amount,
          token: ICPToken,
        }),
        fee: feeE8s,
        fromSubAccount: undefined,
        identity: mockIdentity,
        to: decodeIcrcAccount(mockSnsMainAccount.identifier),
      });
    });

    it("should sync balances after transfer ICP", async () => {
      await transferICP(transferICPParams);

      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: sourceAccount.identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: sourceAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledTimes(2);
    });

    it("should sync destination balances after transfer ICP to own account", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      await transferICP({
        ...transferICPParams,
        destinationAddress: mockSubAccount.identifier,
      });

      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockSubAccount.identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockSubAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: sourceAccount.identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: sourceAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledTimes(4);
    });

    it("should show toast on error", async () => {
      spySendICP.mockRejectedValue(new Error());

      expect(get(toastsStore)).toEqual([]);

      await transferICP(transferICPParams);

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Sorry, there was an error trying to execute the transaction. ",
        },
      ]);

      expect(queryAccountBalanceSpy).not.toHaveBeenCalled();
    });

    it("should show toast on TxTooOldError", async () => {
      spySendICP.mockRejectedValue(new TxTooOldError());

      expect(get(toastsStore)).toEqual([]);

      await transferICP(transferICPParams);

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Transaction is too old, could not be completed. Make sure your computer’s clock is set correctly, and try again. ",
        },
      ]);

      expect(queryAccountBalanceSpy).not.toHaveBeenCalled();
    });

    it("should show toast on TxCreatedInFutureError", async () => {
      spySendICP.mockRejectedValue(new TxCreatedInFutureError());

      expect(get(toastsStore)).toEqual([]);

      await transferICP(transferICPParams);

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Transaction was created in the future, could not be completed. Make sure your computer’s clock is set correctly, and try again. ",
        },
      ]);

      expect(queryAccountBalanceSpy).not.toHaveBeenCalled();
    });
  });

  describe("rename", () => {
    let queryAccountBalanceSpy: MockInstance;
    let queryAccountSpy: MockInstance;
    let spyRenameSubAccount: MockInstance;
    beforeEach(() => {
      queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(0n);
      queryAccountSpy = vi
        .spyOn(nnsDappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      spyRenameSubAccount = vi
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

    it("should rename a subaccount for Icrc address", async () => {
      const newName = "test subaccount";

      await renameSubAccount({
        newName,
        selectedAccount: mockSnsSubAccount,
      });

      expect(spyRenameSubAccount).toHaveBeenCalledWith({
        identity: mockIdentity,
        newName,
        subIcpAccountIdentifier: toIcpAccountIdentifier(
          mockSnsSubAccount.identifier
        ),
      });
    });

    it("should sync accounts after rename", async () => {
      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(queryAccountSpy).toHaveBeenCalled();
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
    });

    it("should not rename subaccount if no identity", async () => {
      setNoIdentity();

      expect(get(toastsStore)).toEqual([]);

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "An error occurred while renaming your linked account. The operation cannot be executed without any identity.",
        },
      ]);

      resetIdentity();
    });

    it("should not rename subaccount if no selected account", async () => {
      expect(get(toastsStore)).toEqual([]);

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: undefined,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "No linked account provided.",
        },
      ]);
    });

    it("should not rename subaccount if type is not subaccount", async () => {
      expect(get(toastsStore)).toEqual([]);

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockMainAccount,
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "The account provided is not a linked account. Only linked account can be renamed.",
        },
      ]);
    });
  });

  describe("getAccountIdentity", () => {
    it("returns user identity if main account", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
      });
      const expectedIdentity = await getAccountIdentity(
        mockMainAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
    });

    it("returns user identity if main account", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      const expectedIdentity = await getAccountIdentity(
        mockMainAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
    });

    it("returns calls for hardware walleet identity if hardware wallet account", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentity(
        mockHardwareWalletAccount.identifier
      );
      expect(expectedIdentity).toBe(mockLedgerIdentity);
      expect(getLedgerIdentityProxy).toBeCalled();
    });
  });

  describe("getAccountIdentityByPrincipal", () => {
    it("returns user identity if main account", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        mockMainAccount.principal?.toText() as string
      );
      expect(expectedIdentity).toBe(mockIdentity);
    });

    it("returns calls for hardware walleet identity if hardware wallet account", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        mockHardwareWalletAccount.principal?.toText() as string
      );
      expect(expectedIdentity).toBe(mockLedgerIdentity);
      expect(getLedgerIdentityProxy).toBeCalled();
    });

    it("returns null if no main account nor hardware wallet account", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        "gje2w-p7x7x-yuy72-bllam-x2itq-znokr-jnvf6-5dzn4-45jiy-5wvbo-uqe"
      );
      expect(expectedIdentity).toBeUndefined();
    });
  });

  describe("pollAccounts", () => {
    const mainBalanceE8s = 10_000_000n;
    const mockAccounts = {
      main: {
        ...mockMainAccount,
        balanceUlps: mainBalanceE8s,
      },
      subAccounts: [],
      hardwareWallets: [],
    };

    beforeEach(() => {
      resetAccountsForTesting();
      vi.clearAllTimers();
      cancelPollAccounts();
      const now = Date.now();
      vi.useFakeTimers().setSystemTime(now);
    });

    it("calls apis and sets accountsStore", async () => {
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const queryAccountSpy = vi
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);

      await pollAccounts();

      expect(queryAccountSpy).toHaveBeenCalledTimes(1);
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toBeCalledTimes(1);

      const accounts = get(icpAccountsStore);
      expect(accounts).toEqual(mockAccounts);
      expect(get(icpAccountDetailsStore)).toEqual({
        accountDetails: mockAccountDetails,
        certified: true,
      });
      expect(get(icpAccountBalancesStore)).toEqual({
        [mockAccountDetails.account_identifier]: {
          balanceE8s: mainBalanceE8s,
          certified: true,
        },
      });
    });

    it("calls apis with certified param used", async () => {
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      const queryAccountSpy = vi
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
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified: false,
      });
      expect(get(icpAccountDetailsStore)).toEqual({
        accountDetails: mockAccountDetails,
        certified: false,
      });
      expect(get(icpAccountBalancesStore)).toEqual({
        [mockAccountDetails.account_identifier]: {
          balanceE8s: mainBalanceE8s,
          certified: false,
        },
      });
    });

    it("polls if queryAccount fails", async () => {
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      const callsUntilSuccess = 4;
      const error = new Error("test");
      const queryAccountSpy = vi
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

      const accounts = get(icpAccountsStore);
      return expect(accounts).toEqual(mockAccounts);
    });

    it("stops polling when cancelPollAccounts is called", async () => {
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mainBalanceE8s
      );
      const error = new Error("test");
      const queryAccountSpy = vi
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
