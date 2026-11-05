import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import * as nnsdappApi from "$lib/api/nns-dapp.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
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
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import {
  AccountIdentifier,
  TxCreatedInFutureError,
  TxDuplicateError,
  TxTooOldError,
} from "@icp-sdk/canisters/ledger/icp";
import { decodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { HttpFetchErrorCode, TransportError } from "@icp-sdk/core/agent";
import { get } from "svelte/store";
import type { MockInstance } from "vitest";

// In Vitest 4, we need to use importOriginal to partially mock the module
vi.mock("$lib/api/nns-dapp.api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/api/nns-dapp.api")>();
  return {
    ...actual,
  };
});

vi.mock("$lib/api/icp-ledger.api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("$lib/api/icp-ledger.api")>();
  return {
    ...actual,
  };
});

const blockedApiPaths = ["$lib/api/nns-dapp.api", "$lib/api/icp-ledger.api"];

describe("icp-accounts.services", () => {
  const mockLedgerIdentity = new MockLedgerIdentity();

  blockAllCallsTo(blockedApiPaths, {
    "$lib/api/nns-dapp.api": nnsDappApi,
    "$lib/api/icp-ledger.api": ledgerApi,
  });

  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue();
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
          text: en.error.accounts_not_found,
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
          text: "Sorry, there was an unexpected error when creating your linked account, please try again.",
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
      localStorage.clear();
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
        createdAt: expect.any(BigInt),
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
          text: "Sorry, there was an error trying to execute the transaction.",
        },
      ]);

      expect(queryAccountBalanceSpy).not.toHaveBeenCalled();
    });

    it("should warn and reload balances if the transfer outcome is unknown", async () => {
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      spySendICP.mockRejectedValue(
        TransportError.fromCode(new HttpFetchErrorCode(new Error("fetch")))
      );

      const result = await transferICP(transferICPParams);

      expect(result).toEqual({
        success: false,
        err: "error.transaction_unknown_outcome",
      });
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: en.error.transaction_unknown_outcome,
        },
      ]);
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: sourceAccount.identifier,
        certified: true,
      });
      expect(queryAccountBalanceSpy).toHaveBeenCalledWith({
        identity: mockIdentity,
        icpAccountIdentifier: mockSubAccount.identifier,
        certified: true,
      });
    });

    describe("when the user repeats a transfer with an unknown outcome", () => {
      const unknownOutcomeError = TransportError.fromCode(
        new HttpFetchErrorCode(new Error("fetch"))
      );
      const createdAtOfCall = (index: number): bigint =>
        spySendICP.mock.calls[index][0].createdAt;

      beforeEach(async () => {
        vi.useFakeTimers({ now: 1_000_000_000_000, toFake: ["Date"] });
        setAccountsForTesting({
          main: mockMainAccount,
          subAccounts: [mockSubAccount],
        });
        spySendICP.mockRejectedValueOnce(unknownOutcomeError);
        await transferICP(transferICPParams);
        vi.setSystemTime(Date.now() + 1_000);
        toastsStore.reset();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it("should reuse the timestamp", async () => {
        await transferICP(transferICPParams);

        expect(createdAtOfCall(1)).toEqual(createdAtOfCall(0));
      });

      it("should reuse the timestamp for an equivalent ICP memo", async () => {
        localStorage.clear();
        spySendICP.mockClear();
        spySendICP.mockRejectedValueOnce(unknownOutcomeError);
        await transferICP({ ...transferICPParams, memo: "1" });
        await transferICP({ ...transferICPParams, memo: "01" });

        expect(createdAtOfCall(1)).toEqual(createdAtOfCall(0));
      });

      it("should reuse the timestamp for a destination in uppercase", async () => {
        await transferICP({
          ...transferICPParams,
          destinationAddress:
            transferICPParams.destinationAddress.toUpperCase(),
        });

        expect(createdAtOfCall(1)).toEqual(createdAtOfCall(0));
      });

      it("should reuse the timestamp for a zero ICP memo", async () => {
        await transferICP({ ...transferICPParams, memo: "0" });

        expect(createdAtOfCall(1)).toEqual(createdAtOfCall(0));
      });

      it("should keep the timestamp after another unknown outcome", async () => {
        spySendICP.mockRejectedValueOnce(unknownOutcomeError);
        await transferICP(transferICPParams);
        await transferICP(transferICPParams);

        expect(createdAtOfCall(2)).toEqual(createdAtOfCall(0));
      });

      it("should keep the timestamp after a rejection", async () => {
        spySendICP.mockRejectedValueOnce(new Error("test"));
        await transferICP(transferICPParams);
        await transferICP(transferICPParams);

        expect(createdAtOfCall(2)).toEqual(createdAtOfCall(0));
      });

      it("should use a new timestamp for another amount", async () => {
        await transferICP({ ...transferICPParams, amount: 2 });

        expect(createdAtOfCall(1)).not.toEqual(createdAtOfCall(0));
      });

      it("should use a new timestamp after the retry succeeds", async () => {
        await transferICP(transferICPParams);
        await transferICP(transferICPParams);

        expect(createdAtOfCall(2)).not.toEqual(createdAtOfCall(0));
      });

      it("should use a new timestamp after TxTooOldError", async () => {
        spySendICP.mockRejectedValueOnce(new TxTooOldError());
        await transferICP(transferICPParams);
        await transferICP(transferICPParams);

        expect(createdAtOfCall(2)).not.toEqual(createdAtOfCall(0));
      });

      it("should report a duplicate as already sent", async () => {
        spySendICP.mockRejectedValueOnce(new TxDuplicateError(10n));
        queryAccountBalanceSpy.mockClear();

        const result = await transferICP(transferICPParams);

        expect(result).toEqual({ success: true, alreadySent: true });
        expect(get(toastsStore)).toEqual([]);
        expect(queryAccountBalanceSpy).toHaveBeenCalled();
      });

      it("should use a new timestamp after a duplicate", async () => {
        spySendICP.mockRejectedValueOnce(new TxDuplicateError(10n));
        await transferICP(transferICPParams);
        await transferICP(transferICPParams);

        expect(createdAtOfCall(2)).not.toEqual(createdAtOfCall(0));
      });
    });

    describe("when the user repeats an ICRC-1 transfer with an unknown outcome", () => {
      const icrcParams: NewTransaction = {
        ...transferICPParams,
        destinationAddress: mockSnsMainAccount.identifier,
      };
      let spySendIcpIcrc1: MockInstance;

      beforeEach(async () => {
        vi.useFakeTimers({ now: 1_000_000_000_000, toFake: ["Date"] });
        setAccountsForTesting({
          main: mockMainAccount,
          subAccounts: [mockSubAccount],
        });
        spySendIcpIcrc1 = vi
          .spyOn(ledgerApi, "sendIcpIcrc1")
          .mockResolvedValue(20n)
          .mockRejectedValueOnce(
            TransportError.fromCode(new HttpFetchErrorCode(new Error("fetch")))
          );
        await transferICP(icrcParams);
        vi.setSystemTime(Date.now() + 1_000);
        toastsStore.reset();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it("should reuse the timestamp", async () => {
        await transferICP(icrcParams);

        const [[first], [second]] = spySendIcpIcrc1.mock.calls;
        expect(second.createdAt).toEqual(first.createdAt);
      });

      it("should reuse the timestamp for the same account in hex", async () => {
        await transferICP({
          ...icrcParams,
          destinationAddress: toIcpAccountIdentifier(
            mockSnsMainAccount.identifier
          ),
        });

        expect(spySendICP.mock.calls[0][0].createdAt).toEqual(
          spySendIcpIcrc1.mock.calls[0][0].createdAt
        );
      });

      it("should report a duplicate as already sent", async () => {
        spySendIcpIcrc1.mockRejectedValueOnce(new TxDuplicateError(10n));

        const result = await transferICP(icrcParams);

        expect(result).toEqual({ success: true, alreadySent: true });
        expect(get(toastsStore)).toEqual([]);
      });

      it("should use a new timestamp after the retry succeeds", async () => {
        await transferICP(icrcParams);
        await transferICP(icrcParams);

        const { calls } = spySendIcpIcrc1.mock;
        expect(calls[2][0].createdAt).not.toEqual(calls[0][0].createdAt);
      });
    });

    it("should save the attempt before the ledger call", async () => {
      let saved: string | null = null;
      spySendICP.mockImplementationOnce(async () => {
        saved = localStorage.getItem(StoreLocalStorageKey.TransferAttempts);
        return 20n;
      });

      await transferICP(transferICPParams);

      expect(saved).toContain(transferICPParams.destinationAddress);
    });

    it("should use a new timestamp after a rejected first attempt", async () => {
      vi.useFakeTimers({ now: 1_000_000_000_000, toFake: ["Date"] });
      spySendICP.mockRejectedValueOnce(new Error("test"));
      await transferICP(transferICPParams);
      vi.setSystemTime(Date.now() + 1_000);
      await transferICP(transferICPParams);
      vi.useRealTimers();

      const [[first], [second]] = spySendICP.mock.calls;
      expect(second.createdAt).not.toEqual(first.createdAt);
    });

    it("should report a duplicate of a new transfer as a failure", async () => {
      spySendICP.mockRejectedValue(new TxDuplicateError(10n));

      const result = await transferICP(transferICPParams);

      expect(result).toEqual({
        success: false,
        err: "error.transaction_error",
      });
    });

    it("should show toast on TxTooOldError", async () => {
      spySendICP.mockRejectedValue(new TxTooOldError());

      expect(get(toastsStore)).toEqual([]);

      await transferICP(transferICPParams);

      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: "Transaction is too old, could not be completed. Make sure your computer’s clock is set correctly, and try again.",
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
          text: "Transaction was created in the future, could not be completed. Make sure your computer’s clock is set correctly, and try again.",
        },
      ]);

      expect(queryAccountBalanceSpy).not.toHaveBeenCalled();
    });

    it("should transfer ICP with valid memo for ICP address", async () => {
      await transferICP({
        ...transferICPParams,
        memo: "123",
      });

      expect(spySendICP).toHaveBeenCalledWith({
        identity: mockIdentity,
        createdAt: expect.any(BigInt),
        to: transferICPParams.destinationAddress,
        fromSubAccount: undefined,
        amount: TokenAmount.fromNumber({
          amount: transferICPParams.amount,
          token: ICPToken,
        }).toE8s(),
        fee: get(mainTransactionFeeE8sStore),
        memo: 123n,
      });
    });

    it("should transfer ICP with valid memo for ICRC address", async () => {
      const spy = vi.spyOn(ledgerApi, "sendIcpIcrc1").mockResolvedValue(1n);

      await transferICP({
        ...transferICPParams,
        destinationAddress: mockSnsMainAccount.identifier,
        memo: "test memo",
      });

      expect(spy).toHaveBeenCalledWith({
        identity: mockIdentity,
        createdAt: expect.any(BigInt),
        to: decodeIcrcAccount(mockSnsMainAccount.identifier),
        fromSubAccount: undefined,
        amount: TokenAmount.fromNumber({
          amount: transferICPParams.amount,
          token: ICPToken,
        }),
        fee: get(mainTransactionFeeE8sStore),
        icrc1Memo: new TextEncoder().encode("test memo"),
      });
    });

    it("should transfer ICP without memo for invalid ICP memo", async () => {
      await transferICP({
        ...transferICPParams,
        memo: "invalid",
      });

      expect(spySendICP).toHaveBeenCalledWith({
        identity: mockIdentity,
        createdAt: expect.any(BigInt),
        to: transferICPParams.destinationAddress,
        fromSubAccount: undefined,
        amount: TokenAmount.fromNumber({
          amount: transferICPParams.amount,
          token: ICPToken,
        }).toE8s(),
        fee: get(mainTransactionFeeE8sStore),
        memo: undefined,
      });
    });

    it("should transfer ICP without memo for invalid ICRC memo", async () => {
      const spy = vi.spyOn(ledgerApi, "sendIcpIcrc1").mockResolvedValue(1n);

      await transferICP({
        ...transferICPParams,
        destinationAddress: mockSnsMainAccount.identifier,
        memo: "a".repeat(33), // exceeds 32 bytes
      });

      expect(spy).toHaveBeenCalledWith({
        identity: mockIdentity,
        createdAt: expect.any(BigInt),
        to: decodeIcrcAccount(mockSnsMainAccount.identifier),
        fromSubAccount: undefined,
        amount: TokenAmount.fromNumber({
          amount: transferICPParams.amount,
          token: ICPToken,
        }),
        fee: get(mainTransactionFeeE8sStore),
        icrc1Memo: undefined,
      });
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
          text: "An error occurred while renaming your linked account.",
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

    it("returns calls for hardware walleet identity if Ledger device account", async () => {
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

    it("returns calls for hardware walleet identity if Ledger device account", async () => {
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

    it("returns null if no main account nor Ledger device account", async () => {
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
