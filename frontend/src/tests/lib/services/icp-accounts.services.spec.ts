import * as accountsApi from "$lib/api/accounts.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import * as nnsdappApi from "$lib/api/nns-dapp.api";
import { AccountNotFoundError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type { AccountDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import { DEFAULT_TRANSACTION_PAGE_LIMIT } from "$lib/constants/constants";
import { mainTransactionFeeE8sStore } from "$lib/derived/main-transaction-fee.derived";
import { getLedgerIdentityProxy } from "$lib/proxy/icp-ledger.services.proxy";
import * as authServices from "$lib/services/auth.services";
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
} from "$lib/services/icp-accounts.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import * as toastsFunctions from "$lib/stores/toasts.store";
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
  mockHardwareWalletAccountDetails,
  mockMainAccount,
  mockSubAccount,
  mockSubAccountDetails,
} from "$tests/mocks/icp-accounts.store.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { mockSentToSubAccountTransaction } from "$tests/mocks/transaction.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { decodeIcrcAccount, encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import {
  ICPToken,
  TokenAmount,
  arrayOfNumberToUint8Array,
} from "@dfinity/utils";
import { get } from "svelte/store";
import type { SpyInstance } from "vitest";

vi.mock("$lib/proxy/icp-ledger.services.proxy", () => {
  return {
    getLedgerIdentityProxy: vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockIdentity)),
  };
});

vi.mock("$lib/api/nns-dapp.api");
vi.mock("$lib/api/icp-ledger.api");
const blockedApiPaths = ["$lib/api/nns-dapp.api", "$lib/api/icp-ledger.api"];

describe("icp-accounts.services", () => {
  blockAllCallsTo(blockedApiPaths);

  beforeEach(() => {
    vi.spyOn(console, "error").mockReturnValue();
    vi.clearAllMocks();
    toastsStore.reset();
    icpAccountsStore.resetForTesting();
    overrideFeatureFlagsStore.reset();
    resetIdentity();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
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

  describe("loadAccounts", () => {
    it("should call ledger and nnsdapp to get account and balance", async () => {
      const queryAccountSpy = vi
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(0n);
      const certified = true;
      await loadAccounts({
        identity: mockIdentity,
        certified,
      });

      expect(queryAccountSpy).toBeCalled();
      expect(queryAccountBalanceSpy).toBeCalledWith({
        identity: mockIdentity,
        certified,
        icpAccountIdentifier: mockAccountDetails.account_identifier,
      });
    });

    it("should get balances of subaccounts", async () => {
      const accountDetails: AccountDetails = {
        ...mockAccountDetails,
        sub_accounts: [mockSubAccountDetails],
      };
      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(accountDetails);
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(0n);

      const certified = true;
      await loadAccounts({
        identity: mockIdentity,
        certified,
      });

      // Called once for main, another for the subaccount
      expect(queryAccountBalanceSpy).toBeCalledWith({
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified,
        identity: mockIdentity,
      });
      expect(queryAccountBalanceSpy).toBeCalledWith({
        icpAccountIdentifier: mockSubAccountDetails.account_identifier,
        certified,
        identity: mockIdentity,
      });
    });

    it("should get balances of hardware wallet accounts", async () => {
      const accountDetails: AccountDetails = {
        ...mockAccountDetails,
        hardware_wallet_accounts: [mockHardwareWalletAccountDetails],
      };
      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(accountDetails);
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(0n);

      const certified = true;
      await loadAccounts({
        identity: mockIdentity,
        certified,
      });

      // Called once for main, another for the hardware wallet = 2
      expect(queryAccountBalanceSpy).toBeCalledWith({
        icpAccountIdentifier: mockAccountDetails.account_identifier,
        certified,
        identity: mockIdentity,
      });
      expect(queryAccountBalanceSpy).toBeCalledWith({
        icpAccountIdentifier:
          mockHardwareWalletAccountDetails.account_identifier,
        certified,
        identity: mockIdentity,
      });
    });

    it("should map ICP identifiers only", async () => {
      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue(
        mockAccountDetails
      );
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mockMainAccount.balanceUlps
      );
      const certified = true;
      const result = await loadAccounts({
        identity: mockIdentity,
        certified,
      });

      expect(result).toEqual({
        main: mockMainAccount,
        subAccounts: [],
        hardwareWallets: [],
        certified: true,
      });
    });

    it("should map ICRC identifiers", async () => {
      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue({
        principal: mockMainAccount.principal,
        sub_accounts: [],
        hardware_wallet_accounts: [
          {
            principal: mockHardwareWalletAccount.principal,
            name: mockHardwareWalletAccount.name,
            account_identifier: mockHardwareWalletAccount.icpIdentifier,
          },
        ],
        account_identifier: mockMainAccount.identifier,
      });
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mockHardwareWalletAccount.balanceUlps
      );
      const certified = true;

      overrideFeatureFlagsStore.setFlag("ENABLE_ICP_ICRC", true);

      const result = await loadAccounts({
        identity: mockIdentity,
        certified,
      });

      expect(result).toEqual({
        main: {
          ...mockMainAccount,
          identifier: encodeIcrcAccount({
            owner: mockMainAccount.principal,
          }),
        },
        subAccounts: [],
        hardwareWallets: [
          {
            ...mockHardwareWalletAccount,
            identifier: encodeIcrcAccount({
              owner: mockHardwareWalletAccount.principal,
            }),
          },
        ],
        certified: true,
      });
    });

    it("should map ICRC identifiers with subaccounts", async () => {
      const principal = Principal.fromText(
        "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
      );

      vi.spyOn(nnsdappApi, "queryAccount").mockResolvedValue({
        principal,
        sub_accounts: [
          {
            name: mockSubAccount.name,
            account_identifier: mockSubAccount.icpIdentifier,
            sub_account: mockSubAccount.subAccount,
          },
        ],
        hardware_wallet_accounts: [],
        account_identifier: AccountIdentifier.fromPrincipal({
          principal,
        }).toHex(),
      });
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        mockHardwareWalletAccount.balanceUlps
      );
      const certified = true;

      overrideFeatureFlagsStore.setFlag("ENABLE_ICP_ICRC", true);

      const result = await loadAccounts({
        identity: mockIdentity,
        certified,
      });

      expect(result).toEqual({
        main: {
          ...mockMainAccount,
          identifier: encodeIcrcAccount({
            owner: principal,
          }),
          icpIdentifier: AccountIdentifier.fromPrincipal({ principal }).toHex(),
          principal,
        },
        subAccounts: [
          {
            ...mockSubAccount,
            identifier: encodeIcrcAccount({
              owner: principal,
              subaccount: arrayOfNumberToUint8Array(mockSubAccount.subAccount),
            }),
          },
        ],
        hardwareWallets: [],
        certified: true,
      });
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
        certified: true,
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
        certified: true,
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
        certified,
      }: {
        mainBalanceE8s: bigint;
        certified: boolean;
      }) => ({
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: [],
        hardwareWallets: [],
        certified,
      });
      await syncAccounts();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: queryMainBalanceE8s, certified: false })
      );

      resolveUpdateResponse();
      await runResolvedPromises();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: updateMainBalanceE8s, certified: true })
      );
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
        certified,
      }: {
        mainBalanceE8s: bigint;
        certified: boolean;
      }) => ({
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: [],
        hardwareWallets: [],
        certified,
      });
      await syncAccounts();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: queryMainBalanceE8s, certified: false })
      );

      const newerMainBalanceE8s = 30_000_000n;
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        newerMainBalanceE8s
      );
      await syncAccounts();
      await runResolvedPromises();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: newerMainBalanceE8s, certified: true })
      );

      resolveUpdateResponse();
      await runResolvedPromises();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: newerMainBalanceE8s, certified: true })
      );
    });
  });

  describe("loadBalance", () => {
    it("should query account balance and load it in store", async () => {
      const newBalanceE8s = 10_000_000n;
      const queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(newBalanceE8s);
      icpAccountsStore.setForTesting({
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
      icpAccountsStore.setForTesting({
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
      icpAccountsStore.setForTesting({
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
        certified,
      }: {
        mainBalanceE8s: bigint;
        certified?: boolean;
      }) => ({
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: [],
        hardwareWallets: [],
        certified,
      });
      await syncAccounts();

      expect(get(icpAccountsStore)).toEqual(
        accountsWith({ mainBalanceE8s: queryMainBalanceE8s, certified: false })
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

    let queryAccountBalanceSpy: SpyInstance;
    let queryAccountSpy: SpyInstance;
    let spyCreateSubAccount: SpyInstance;
    beforeEach(() => {
      queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      queryAccountSpy = vi
        .spyOn(nnsdappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
      spyCreateSubAccount = vi
        .spyOn(accountsApi, "createSubAccount")
        .mockResolvedValue(undefined);
    });

    it("should sync accounts", async () => {
      const mockAccounts = {
        main: {
          ...mockMainAccount,
          balanceUlps: mainBalanceE8s,
        },
        subAccounts: [],
        hardwareWallets: [],
        certified: true,
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
      const spyToastError = vi.spyOn(toastsFunctions, "toastsError");

      setNoIdentity();

      await addSubAccount({
        name: "test subaccount",
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error__account.create_subaccount",
        err: new Error(en.error.missing_identity),
        renderAsHtml: true,
      });

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
    let queryAccountBalanceSpy: SpyInstance;
    let spySendICP: SpyInstance;
    beforeEach(() => {
      queryAccountBalanceSpy = vi
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      spySendICP = vi.spyOn(ledgerApi, "sendICP").mockResolvedValue(20n);
    });

    it("should transfer ICP", async () => {
      await transferICP(transferICPParams);

      expect(spySendICP).toHaveBeenCalled();
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
      icpAccountsStore.setForTesting({
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
  });

  describe("rename", () => {
    let queryAccountBalanceSpy: SpyInstance;
    let queryAccountSpy: SpyInstance;
    let spyRenameSubAccount: SpyInstance;
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
      const spyToastError = vi.spyOn(toastsFunctions, "toastsError");

      setNoIdentity();

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockSubAccount,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount",
        err: new Error(en.error.missing_identity),
        renderAsHtml: true,
      });

      resetIdentity();

      spyToastError.mockClear();
    });

    it("should not rename subaccount if no selected account", async () => {
      const spyToastError = vi.spyOn(toastsFunctions, "toastsError");

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: undefined,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount_no_account",
        renderAsHtml: true,
      });

      spyToastError.mockClear();
    });

    it("should not rename subaccount if type is not subaccount", async () => {
      const spyToastError = vi.spyOn(toastsFunctions, "toastsError");

      await renameSubAccount({
        newName: "test subaccount",
        selectedAccount: mockMainAccount,
      });

      expect(spyToastError).toBeCalled();
      expect(spyToastError).toBeCalledWith({
        labelKey: "error.rename_subaccount_type",
        renderAsHtml: true,
      });

      spyToastError.mockClear();
    });
  });

  describe("getAccountTransactions", () => {
    const onLoad = vi.fn();
    const mockResponse = [mockSentToSubAccountTransaction];
    let spyGetTransactions;

    beforeEach(() => {
      vi.clearAllMocks();
      spyGetTransactions = vi
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

    it("should call getTransactions for Icrc address", async () => {
      await getAccountTransactions({
        accountIdentifier: mockSnsMainAccount.identifier,
        onLoad,
      });

      const params = {
        identity: mockIdentity,
        icpAccountIdentifier: mockSnsAccountIcpAccountIdentifier,
        certified: true,
        offset: 0,
        pageSize: DEFAULT_TRANSACTION_PAGE_LIMIT,
      };

      expect(spyGetTransactions).toHaveBeenCalledWith(params);
      expect(spyGetTransactions).toHaveBeenCalledWith({
        ...params,
        certified: false,
      });
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
        spyGetTransactions = vi
          .spyOn(accountsApi, "getTransactions")
          .mockImplementation(async () => {
            throw new Error("test");
          });
      });

      it("should display toast error", async () => {
        const spyToastError = vi.spyOn(toastsFunctions, "toastsError");

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
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
      });
      const expectedIdentity = await getAccountIdentity(
        mockMainAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
    });

    it("returns user identity if main account", async () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
      });
      const expectedIdentity = await getAccountIdentity(
        mockMainAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
    });

    it("returns calls for hardware walleet identity if hardware wallet account", async () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentity(
        mockHardwareWalletAccount.identifier
      );
      expect(expectedIdentity).toBe(mockIdentity);
      expect(getLedgerIdentityProxy).toBeCalled();
    });
  });

  describe("getAccountIdentityByPrincipal", () => {
    it("returns user identity if main account", async () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        mockMainAccount.principal?.toText() as string
      );
      expect(expectedIdentity).toBe(mockIdentity);
    });

    it("returns calls for hardware walleet identity if hardware wallet account", async () => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
      });
      const expectedIdentity = await getAccountIdentityByPrincipal(
        mockHardwareWalletAccount.principal?.toText() as string
      );
      expect(expectedIdentity).toBe(mockIdentity);
      expect(getLedgerIdentityProxy).toBeCalled();
    });

    it("returns null if no main account nor hardware wallet account", async () => {
      icpAccountsStore.setForTesting({
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
      certified: true,
    };

    beforeEach(() => {
      icpAccountsStore.resetForTesting();
      vi.clearAllTimers();
      vi.clearAllMocks();
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
