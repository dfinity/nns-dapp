import * as snsIndexApi from "$lib/api/sns-index.api";
import * as snsLedgerApi from "$lib/api/sns-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import SnsWallet from "$lib/pages/SnsWallet.svelte";
import * as workerBalances from "$lib/services/worker-balances.services";
import * as workerTransactions from "$lib/services/worker-transactions.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import { page } from "$mocks/$app/stores";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { SnsWalletPo } from "$tests/page-objects/SnsWallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/sns-ledger.api");
vi.mock("$lib/api/sns-index.api");

let balancesObserverCallback;

vi.mock("$lib/services/worker-transactions.services", () => ({
  initTransactionsWorker: vi.fn(() =>
    Promise.resolve({
      startTransactionsTimer: () => {
        // Do nothing
      },
      stopTransactionsTimer: () => {
        // Do nothing
      },
    })
  ),
}));

vi.mock("$lib/services/worker-balances.services", () => ({
  initBalancesWorker: vi.fn(() =>
    Promise.resolve({
      startBalancesTimer: ({ callback }) => {
        balancesObserverCallback = callback;
      },
      stopBalancesTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("SnsWallet", () => {
  const testTokenSymbol = "OOO";
  const testTokenName = "Out of office";

  const testToken = {
    ...mockSnsToken,
    name: testTokenName,
    symbol: testTokenSymbol,
  };

  const props = {
    accountIdentifier: mockSnsMainAccount.identifier,
  };

  const rootCanisterId = rootCanisterIdMock;
  const rootCanisterIdText = rootCanisterId.toText();
  const fee = 10_000n;
  const projectName = "Tetris";

  const renderComponent = async (props: { accountIdentifier?: string }) => {
    const { container } = render(SnsWallet, props);
    await runResolvedPromises();
    return SnsWalletPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();
    vi.clearAllMocks();
    snsAccountsStore.reset();
    tokensStore.reset();
    toastsStore.reset();
    overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);
    vi.spyOn(snsIndexApi, "getSnsTransactions").mockResolvedValue({
      oldestTxId: 1_234n,
      transactions: [mockIcrcTransactionWithId],
    });
    vi.spyOn(snsLedgerApi, "transactionFee").mockResolvedValue(fee);
    vi.spyOn(snsLedgerApi, "getSnsToken").mockResolvedValue(testToken);
    vi.spyOn(snsLedgerApi, "snsTransfer").mockResolvedValue(10n);

    setSnsProjects([
      {
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        projectName,
        tokenMetadata: testToken,
      },
    ]);
    tokensStore.setToken({
      canisterId: rootCanisterId,
      token: {
        ...testToken,
        fee,
      },
      certified: true,
    });
    page.mock({
      data: { universe: rootCanisterIdText },
      routeId: AppPath.Wallet,
    });
  });

  describe("user not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
    });

    it("should not activate the balances observer", async () => {
      await renderComponent({});
      expect(balancesObserverCallback).toBeUndefined();
    });

    it("should render universe name", async () => {
      const po = await renderComponent({});
      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe("Tetris");
    });

    it("should not render a wallet address", async () => {
      const po = await renderComponent({});
      expect(await po.getWalletPageHeaderPo().getHashPo().isPresent()).toBe(
        false
      );
    });

    it("should render balance placeholder", async () => {
      const po = await renderComponent({});
      expect(await po.getWalletPageHeadingPo().hasBalancePlaceholder()).toBe(
        true
      );
    });

    it("should render 'Main' account name", async () => {
      const po = await renderComponent({});
      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render sign in button", async () => {
      const po = await renderComponent({});
      expect(await po.hasSignInButton()).toBe(true);
    });

    it("should render transactions placeholder", async () => {
      const po = await renderComponent({});
      expect(await po.hasNoTransactions()).toBe(true);
    });

    it("should not render send/receive buttons", async () => {
      const po = await renderComponent({});
      expect(await po.getSendButtonPo().isPresent()).toBe(false);
      expect(await po.getReceiveButtonPo().isPresent()).toBe(false);
    });
  });

  describe("loading accounts", () => {
    let resolve;

    beforeEach(() => {
      resolve = undefined;
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockImplementation(() => {
        return new Promise<Account[]>((r) => {
          resolve = r;
        });
      });
    });

    it("should hide spinner when account is loaded", async () => {
      const po = await renderComponent(props);

      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(true);

      expect(resolve).toBeDefined();
      resolve([mockSnsMainAccount]);

      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(false);
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockResolvedValue([
        mockSnsMainAccount,
      ]);
    });

    it("should render sns project name", async () => {
      const po = await renderComponent(props);

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe(projectName);
    });

    it("should render transactions", async () => {
      const po = await renderComponent(props);

      expect(await po.getIcrcTransactionsListPo().isPresent()).toBe(true);
    });

    it("should render 'Main' as subtitle", async () => {
      const po = await renderComponent(props);

      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render a balance with token", async () => {
      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockResolvedValue([
        {
          ...mockSnsMainAccount,
          balanceUlps: 2_233_000_000n,
        },
      ]);

      const po = await renderComponent(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe("22.33 OOO");
    });

    it("should open new transaction modal", async () => {
      const po = await renderComponent(props);

      await runResolvedPromises();
      expect(await po.getSnsTransactionModalPo().isPresent()).toBe(false);

      await po.clickSendButton();

      await runResolvedPromises();
      expect(await po.getSnsTransactionModalPo().isPresent()).toBe(true);
    });

    it("should make a new transaction", async () => {
      const po = await renderComponent(props);

      await po.clickSendButton();

      const destinationAccount = {
        owner: principal(1),
      };

      expect(snsLedgerApi.snsTransfer).toHaveBeenCalledTimes(0);

      await po.getSnsTransactionModalPo().transferToAddress({
        destinationAddress: encodeIcrcAccount(destinationAccount),
        amount: 2,
      });

      expect(snsLedgerApi.snsTransfer).toHaveBeenCalledTimes(1);
      expect(snsLedgerApi.snsTransfer).toHaveBeenCalledWith({
        identity: mockIdentity,
        rootCanisterId,
        amount: 200000_000n,
        fromSubaccount: undefined,
        fee,
        to: destinationAccount,
      });
    });

    const modalProps = {
      ...props,
      testComponent: SnsWallet,
    };

    const renderWalletAndModal = async (): Promise<{
      walletPo: SnsWalletPo;
      receiveModalPo: ReceiveModalPo;
    }> => {
      const { container } = render(AccountsTest, modalProps);
      await runResolvedPromises();
      return {
        walletPo: SnsWalletPo.under(new JestPageObjectElement(container)),
        receiveModalPo: ReceiveModalPo.under(
          new JestPageObjectElement(container)
        ),
      };
    };

    it("should open receive modal with sns logo", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      runResolvedPromises();
      expect(await receiveModalPo.isPresent()).toBe(false);

      await walletPo.clickReceiveButton();

      runResolvedPromises();
      expect(await receiveModalPo.isPresent()).toBe(true);
      await receiveModalPo.waitForQrCode();
      expect(await receiveModalPo.getLogoAltText()).toBe(testTokenSymbol);
    });

    it("should reload account after finish receiving tokens", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      await walletPo.clickReceiveButton();

      // Query + update
      expect(snsLedgerApi.getSnsAccounts).toHaveBeenCalledTimes(2);
      // Transactions can only be fetched from the Index canister with `updated` calls for now.
      expect(snsIndexApi.getSnsTransactions).toHaveBeenCalledTimes(1);

      await receiveModalPo.clickFinish();

      await runResolvedPromises();
      expect(snsLedgerApi.getSnsAccounts).toHaveBeenCalledTimes(4);
      expect(snsIndexApi.getSnsTransactions).toHaveBeenCalledTimes(2);
    });

    it("should display receive modal information", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      await walletPo.clickReceiveButton();

      await receiveModalPo.waitForQrCode();

      expect(await receiveModalPo.getTokenAddressLabel()).toBe("OOO Address");
    });

    it("should init worker that sync the balance", async () => {
      const spy = vi.spyOn(workerBalances, "initBalancesWorker");

      await renderComponent(props);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should init worker that sync the transactions", async () => {
      const spy = vi.spyOn(workerTransactions, "initTransactionsWorker");

      const po = await renderComponent(props);

      expect(await po.getIcrcTransactionsListPo().isPresent()).toBe(true);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should default to main account when account identifier is missing", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      const po = await renderComponent({
        accountIdentifier: undefined,
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      expect(get(toastsStore)).toEqual([]);

      expect(await po.getWalletPageHeaderPo().getWalletAddress()).toBe(
        mockSnsMainAccount.identifier
      );
    });

    it("should navigate to accounts when account identifier is invalid", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      await renderComponent({
        accountIdentifier: "invalid-account-identifier",
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Accounts,
        universe: rootCanisterIdText,
      });
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: 'Sorry, the account "invalid-account-identifier" was not found',
        },
      ]);
    });

    it("should navigate to /tokens when account identifier is invalid and tokens page is enabled", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);

      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      await renderComponent({
        accountIdentifier: "invalid-account-identifier",
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Tokens,
        universe: OWN_CANISTER_ID_TEXT,
      });
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: 'Sorry, the account "invalid-account-identifier" was not found',
        },
      ]);
    });

    it("should stay on the wallet page when account identifier is valid", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      await renderComponent({
        accountIdentifier: mockSnsMainAccount.identifier,
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: rootCanisterIdText,
      });
      expect(get(toastsStore)).toEqual([]);
    });

    it("should display the balance from the observer", async () => {
      const oldBalance = 123_000_000n;
      const newBalance = 456_000_000n;

      vi.spyOn(snsLedgerApi, "getSnsAccounts").mockResolvedValue([
        {
          ...mockSnsMainAccount,
          balanceUlps: oldBalance,
        },
      ]);

      const po = await renderComponent(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe("1.23 OOO");

      balancesObserverCallback({
        balances: [
          {
            balance: newBalance,
            accountIdentifier: mockSnsMainAccount.identifier,
          },
        ],
      });

      await runResolvedPromises();
      expect(await po.getWalletPageHeadingPo().getTitle()).toBe("4.56 OOO");
    });
  });
});
