import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as walletLedgerApi from "$lib/api/wallet-ledger.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import IcrcWallet from "$lib/pages/IcrcWallet.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import { page } from "$mocks/$app/stores";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import WalletTest from "$tests/lib/pages/WalletTest.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockCkETHMainAccount,
  mockCkETHTESTToken,
} from "$tests/mocks/cketh-accounts.mock";
import { mockUniversesTokens } from "$tests/mocks/tokens.mock";
import { IcrcWalletPo } from "$tests/page-objects/IcrcWallet.page-object";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

const expectedBalanceAfterTransfer = 11_111n;

let balancesObserverCallback;

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

vi.mock("$lib/api/wallet-ledger.api");
vi.mock("$lib/api/icrc-ledger.api");
vi.mock("$lib/api/icrc-index.api");

const blockedApiPaths = [
  "$lib/api/wallet-ledger.api",
  "$lib/api/icrc-ledger.api",
  "$lib/api/icrc-index.api",
];

describe("IcrcWallet", () => {
  blockAllCallsTo(blockedApiPaths);

  const props = {
    accountIdentifier: mockCkETHMainAccount.identifier,
  };

  const modalProps = {
    ...props,
    testComponent: IcrcWallet,
  };

  const renderWallet = async (props: {
    accountIdentifier?: string;
  }): Promise<IcrcWalletPo> => {
    const { container } = render(WalletTest, {
      ...props,
      testComponent: IcrcWallet,
    });
    await runResolvedPromises();
    return IcrcWalletPo.under(new JestPageObjectElement(container));
  };

  const renderWalletAndModal = async (): Promise<{
    walletPo: IcrcWalletPo;
    receiveModalPo: ReceiveModalPo;
  }> => {
    const { container } = render(AccountsTest, modalProps);
    await runResolvedPromises();
    return {
      walletPo: IcrcWalletPo.under(new JestPageObjectElement(container)),
      receiveModalPo: ReceiveModalPo.under(
        new JestPageObjectElement(container)
      ),
    };
  };

  beforeEach(() => {
    balancesObserverCallback = undefined;
    vi.clearAllMocks();
    vi.clearAllTimers();
    tokensStore.reset();
    overrideFeatureFlagsStore.reset();
    toastsStore.reset();
    resetIdentity();
    overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", false);

    vi.mocked(icrcIndexApi.getTransactions).mockResolvedValue({
      transactions: [],
    });

    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
    });
  });

  describe("user not signed in", () => {
    beforeEach(() => {
      setNoIdentity();
      tokensStore.setTokens(mockUniversesTokens);
      page.mock({
        data: { universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });
    });

    it("should not activate the balances observer", async () => {
      await renderWallet({});
      expect(balancesObserverCallback).toBeUndefined();
    });

    it("should render universe name", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe("ckETHTEST");
    });

    it("should not render a wallet address", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletPageHeaderPo().getHashPo().isPresent()).toBe(
        false
      );
    });

    it("should render balance placeholder", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletPageHeadingPo().hasBalancePlaceholder()).toBe(
        true
      );
    });

    it("should render 'Main' account name", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render sign in button", async () => {
      const po = await renderWallet({});
      expect(await po.hasSignInButton()).toBe(true);
    });

    it("should render transactions placeholder", async () => {
      const po = await renderWallet({});
      expect(await po.hasNoTransactions()).toBe(true);
    });

    it("should not render send/receive buttons", async () => {
      const po = await renderWallet({});
      expect(await po.getWalletFooterPo().getSendButtonPo().isPresent()).toBe(
        false
      );
      expect(
        await po.getWalletFooterPo().getReceiveButtonPo().isPresent()
      ).toBe(false);
    });
  });

  describe("accounts not loaded", () => {
    let resolveAccounts: (Account) => void;

    beforeEach(() => {
      icrcAccountsStore.reset();

      page.mock({
        data: { universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });

      vi.mocked(walletLedgerApi.getAccount).mockImplementation(() => {
        return new Promise<Account>((resolve) => {
          resolveAccounts = resolve;
        });
      });
      vi.mocked(walletLedgerApi.getToken).mockResolvedValue(mockCkETHTESTToken);
    });

    it("should render a spinner while loading", async () => {
      const po = await renderWallet(props);
      expect(await po.hasSpinner()).toBe(true);
      resolveAccounts(mockCkETHMainAccount);
      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(false);
    });

    it("should call to load Icrc accounts", async () => {
      await renderWallet(props);
      expect(walletLedgerApi.getAccount).toBeCalled();
      expect(walletLedgerApi.getToken).toBeCalled();
    });
  });

  describe("accounts loaded", () => {
    let afterTransfer = false;

    beforeEach(() => {
      afterTransfer = false;
      vi.useFakeTimers().setSystemTime(new Date());

      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkETHMainAccount],
          certified: true,
        },
        universeId: CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
      });

      tokensStore.setTokens(mockUniversesTokens);

      page.mock({
        data: { universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText() },
        routeId: AppPath.Wallet,
      });

      vi.mocked(walletLedgerApi.getAccount).mockImplementation(() => {
        return Promise.resolve({
          ...mockCkETHMainAccount,
          ...(afterTransfer
            ? { balanceE8s: expectedBalanceAfterTransfer }
            : {}),
        });
      });
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it("should render Icrc token name", async () => {
      const po = await renderWallet(props);

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe("ckETHTEST");
    });

    it("should render `Main` as subtitle", async () => {
      const po = await renderWallet(props);

      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render a balance with token", async () => {
      const po = await renderWallet(props);

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        "123.00 ckETHTEST"
      );
    });

    it("should open receive modal", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      expect(await receiveModalPo.isPresent()).toBe(false);
      await walletPo.getWalletFooterPo().clickReceiveButton();
      expect(await receiveModalPo.isPresent()).toBe(true);
    });

    it("should reload on close receive modal", async () => {
      const { walletPo, receiveModalPo } = await renderWalletAndModal();

      expect(await receiveModalPo.isPresent()).toBe(false);
      await walletPo.getWalletFooterPo().clickReceiveButton();
      expect(await receiveModalPo.isPresent()).toBe(true);

      // TODO GIX-2150: receiveModalPo.clickFinish() to be debugged
      // const spy = vi.spyOn(services, "loadAccounts");

      // await receiveModalPo.clickFinish();

      // await waitFor(() => expect(spy).toHaveBeenCalled());
    });

    it("should default to main account when account identifier is missing", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText(),
      });
      const po = await renderWallet({
        accountIdentifier: undefined,
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText(),
      });
      expect(get(toastsStore)).toEqual([]);

      expect(await po.getWalletPageHeaderPo().getWalletAddress()).toBe(
        mockCkETHMainAccount.identifier
      );
    });

    it("should navigate to accounts when account identifier is invalid", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText(),
      });
      await renderWallet({
        accountIdentifier: "invalid-account-identifier",
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Accounts,
        universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText(),
      });
      expect(get(toastsStore)).toMatchObject([
        {
          level: "error",
          text: 'Sorry, the account "invalid-account-identifier" was not found',
        },
      ]);

      it("should navigate to /tokens when account identifier is invalid and tokens page is enabled", async () => {
        overrideFeatureFlagsStore.setFlag("ENABLE_MY_TOKENS", true);

        expect(get(pageStore)).toEqual({
          path: AppPath.Wallet,
          universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText(),
        });
        await renderWallet({
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
    });

    it("should stay on the wallet page when account identifier is valid", async () => {
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText(),
      });
      await renderWallet({
        accountIdentifier: mockCkETHMainAccount.identifier,
      });
      expect(get(pageStore)).toEqual({
        path: AppPath.Wallet,
        universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText(),
      });
      expect(get(toastsStore)).toEqual([]);
    });

    it("should display the balance from the observer", async () => {
      const po = await renderWallet(props);
      expect(balancesObserverCallback).toBeDefined();

      await runResolvedPromises();

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        "123.00 ckETHTEST"
      );

      balancesObserverCallback({
        balances: [
          {
            balance: 3_330_000_000_000_000_000n,
            accountIdentifier: mockCkETHMainAccount.identifier,
          },
        ],
      });

      await runResolvedPromises();
      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        "3.33 ckETHTEST"
      );
    });
  });
});
