import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import SnsWallet from "$lib/pages/SnsWallet.svelte";
import * as workerBalances from "$lib/services/worker-balances.services";
import * as workerBalancesServices from "$lib/services/worker-balances.services";
import * as workerTransactions from "$lib/services/worker-transactions.services";
import * as workerTransactionsServices from "$lib/services/worker-transactions.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { aggregatorCanisterLogoPath } from "$lib/utils/sns-aggregator-converters.utils";
import { page } from "$mocks/$app/stores";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import WalletTest from "$tests/lib/pages/WalletTest.svelte";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsToken, principal } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { IcrcTokenTransactionModalPo } from "$tests/page-objects/IcrcTokenTransactionModal.page-object";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { SnsWalletPo } from "$tests/page-objects/SnsWallet.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import {
  advanceTime,
  runResolvedPromises,
} from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/icrc-index.api");

let balancesObserverCallback;

describe("SnsWallet", () => {
  const testTokenSymbol = "OOO";
  const testTokenName = "Out of office";
  const fee = 17_000n;

  const testToken = {
    ...mockSnsToken,
    name: testTokenName,
    symbol: testTokenSymbol,
    fee,
  };

  const props = {
    accountIdentifier: mockSnsMainAccount.identifier,
  };

  const rootCanisterId = rootCanisterIdMock;
  const rootCanisterIdText = rootCanisterId.toText();
  const ledgerCanisterId = Principal.fromText("bw4dl-smaaa-aaaaa-qaacq-cai");
  const indexCanisterId = principal(100);
  const projectName = "Tetris";

  const renderComponent = async (props: { accountIdentifier?: string }) => {
    const { container } = render(WalletTest, {
      ...props,
      testComponent: SnsWallet,
    });
    await runResolvedPromises();
    return SnsWalletPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.useRealTimers();
    resetIdentity();
    icrcAccountsStore.reset();
    tokensStore.reset();
    resetSnsProjects();
    toastsStore.reset();
    vi.mocked(icrcIndexApi.getTransactions).mockResolvedValue({
      transactions: [],
    });
    vi.spyOn(icrcLedgerApi, "icrcTransfer").mockResolvedValue(10n);
    vi.spyOn(
      workerTransactionsServices,
      "initTransactionsWorker"
    ).mockResolvedValue({
      startTransactionsTimer: () => {
        // Do nothing
      },
      stopTransactionsTimer: () => {
        // Do nothing
      },
    });
    vi.spyOn(workerBalancesServices, "initBalancesWorker").mockResolvedValue({
      startBalancesTimer: ({ callback }) => {
        balancesObserverCallback = callback;
      },
      stopBalancesTimer: () => {
        // Do nothing
      },
    });

    setSnsProjects([
      {
        rootCanisterId,
        ledgerCanisterId,
        indexCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        projectName,
        tokenMetadata: testToken,
      },
    ]);
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
      vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockImplementation(() => {
        return new Promise<bigint>((r) => {
          resolve = r;
        });
      });
    });

    it("should hide spinner when account is loaded", async () => {
      const po = await renderComponent(props);

      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(true);

      expect(resolve).toBeDefined();
      resolve(mockSnsMainAccount.balanceUlps);

      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(false);
    });
  });

  describe("accounts loaded", () => {
    beforeEach(() => {
      vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(
        mockSnsMainAccount.balanceUlps
      );
    });

    it("should render sns project name", async () => {
      const po = await renderComponent(props);

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe(projectName);
    });

    it("should render transactions", async () => {
      const po = await renderComponent(props);

      expect(await po.getUiTransactionsListPo().isPresent()).toBe(true);
    });

    it("should render 'Main' as subtitle", async () => {
      const po = await renderComponent(props);

      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render a balance with token", async () => {
      vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(
        2_233_000_000n
      );

      const po = await renderComponent(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe("22.33 OOO");
    });

    it("should open new transaction modal", async () => {
      const { walletPo: po, icrcTokenTransactionModalPo: modalPo } =
        await renderWalletAndModals();

      await runResolvedPromises();
      expect(await modalPo.isPresent()).toBe(false);

      await po.clickSendButton();

      await runResolvedPromises();
      expect(await modalPo.isPresent()).toBe(true);
    });

    it("should make a new transaction", async () => {
      const amountToBeTransferred = 200_000_000n;
      const amountIcps = 2;
      // We need the initial balance to be bigger than the amount to be transferred
      vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(
        amountToBeTransferred * 2n
      );
      const { walletPo: po, icrcTokenTransactionModalPo: modalPo } =
        await renderWalletAndModals();

      await po.clickSendButton();

      const destinationAccount = {
        owner: principal(1),
      };

      expect(icrcLedgerApi.icrcTransfer).toHaveBeenCalledTimes(0);

      await modalPo.transferToAddress({
        destinationAddress: encodeIcrcAccount(destinationAccount),
        amount: amountIcps,
      });

      expect(icrcLedgerApi.icrcTransfer).toHaveBeenCalledTimes(1);
      expect(icrcLedgerApi.icrcTransfer).toHaveBeenCalledWith({
        identity: mockIdentity,
        canisterId: ledgerCanisterId,
        amount: amountToBeTransferred,
        fromSubAccount: undefined,
        fee,
        to: destinationAccount,
      });
    });

    const modalProps = {
      ...props,
      testComponent: SnsWallet,
    };

    const renderWalletAndModals = async (): Promise<{
      walletPo: SnsWalletPo;
      receiveModalPo: ReceiveModalPo;
      icrcTokenTransactionModalPo: IcrcTokenTransactionModalPo;
    }> => {
      const { container } = render(AccountsTest, modalProps);
      await runResolvedPromises();
      const element = new JestPageObjectElement(container);
      return {
        walletPo: SnsWalletPo.under(element),
        receiveModalPo: ReceiveModalPo.under(element),
        icrcTokenTransactionModalPo: IcrcTokenTransactionModalPo.under(element),
      };
    };

    it("should open receive modal with sns logo", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModals();

      runResolvedPromises();
      expect(await receiveModalPo.isPresent()).toBe(false);

      await walletPo.clickReceiveButton();

      runResolvedPromises();
      expect(await receiveModalPo.isPresent()).toBe(true);
      await receiveModalPo.waitForQrCode();
      expect(await receiveModalPo.getLogoAltText()).toBe(testTokenSymbol);
    });

    it("should reload account after finish receiving tokens", async () => {
      vi.useFakeTimers();
      const { walletPo, receiveModalPo } = await renderWalletAndModals();

      expect(await receiveModalPo.isPresent()).toBe(false);
      await walletPo.clickReceiveButton();
      expect(await receiveModalPo.isPresent()).toBe(true);

      // Query + update
      expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenCalledTimes(2);
      // Transactions can only be fetched from the Index canister with `updated` calls for now.
      expect(icrcIndexApi.getTransactions).toHaveBeenCalledTimes(1);

      // The Finish button is only rendered after the modal animation has finished.
      expect(await receiveModalPo.getFinishButtonPo().isPresent()).toBe(false);
      await advanceTime(50);
      expect(await receiveModalPo.getFinishButtonPo().isPresent()).toBe(true);

      await receiveModalPo.clickFinish();

      await runResolvedPromises();
      // IcrcWalletPage does not reload the balance, only the transactions, in
      // `reloadAccount`. Perhaps a bug?
      // The number of calls is still 2, rather than 4.
      expect(icrcLedgerApi.queryIcrcBalance).toHaveBeenCalledTimes(2);
      // IcrcWalletTransactionsList has a hard coded 4 second delay before it
      // fetches the transactions.
      await advanceTime(3500);
      expect(icrcIndexApi.getTransactions).toHaveBeenCalledTimes(1);
      await advanceTime(1000);
      expect(icrcIndexApi.getTransactions).toHaveBeenCalledTimes(2);
    });

    it("should display receive modal information", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModals();

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

      expect(await po.getUiTransactionsListPo().isPresent()).toBe(true);

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

    it("should navigate to /tokens when account identifier is invalid", async () => {
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

      vi.spyOn(icrcLedgerApi, "queryIcrcBalance").mockResolvedValue(oldBalance);

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

    it("should use SNS project logo rather than token logo", async () => {
      const tokenLogo = "http://token.logo";
      const snsProjectLogo = aggregatorCanisterLogoPath(rootCanisterIdText);

      setSnsProjects([
        {
          rootCanisterId,
          ledgerCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
          projectName,
          tokenMetadata: {
            ...testToken,
            logo: "http://token.logo",
          },
        },
      ]);
      const po = await renderComponent(props);

      // This could be considered a bug because the wallet should be based on
      // the token data rather than the project data. But before we fix this bug
      // we want to make sure that SNSes have the ability to change the logo in
      // their ledger canister metadata.
      expect(
        await po.getWalletPageHeaderPo().getUniverseSummaryPo().getLogoUrl()
      ).toBe(snsProjectLogo);
      expect(
        await po.getWalletPageHeaderPo().getUniverseSummaryPo().getLogoUrl()
      ).not.toBe(tokenLogo);
    });

    it('should have canister links in "more" popup', async () => {
      const po = await renderComponent({});
      const morePopoverPo = po.getWalletMorePopoverPo();

      await po.getMoreButton().click();
      await runResolvedPromises();

      expect(await morePopoverPo.getLinkToLedgerCanisterPo().isPresent()).toBe(
        true
      );
      expect(await morePopoverPo.getLinkToLedgerCanisterPo().getHref()).toBe(
        `https://dashboard.internetcomputer.org/canister/${ledgerCanisterId.toText()}`
      );
      expect(await morePopoverPo.getLinkToIndexCanisterPo().isPresent()).toBe(
        true
      );
      expect(await morePopoverPo.getLinkToIndexCanisterPo().getHref()).toBe(
        `https://dashboard.internetcomputer.org/canister/${indexCanisterId.toText()}`
      );
    });
  });
});
