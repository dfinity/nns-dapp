import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as walletLedgerApi from "$lib/api/wallet-ledger.api";
import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import IcrcWallet from "$lib/pages/IcrcWallet.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Account } from "$lib/types/account";
import { page } from "$mocks/$app/stores";
import AccountsTest from "$tests/lib/pages/AccountsTest.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
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
import { render } from "@testing-library/svelte";

const expectedBalanceAfterTransfer = 11_111n;

vi.mock("$lib/services/worker-balances.services", () => ({
  initBalancesWorker: vi.fn(() =>
    Promise.resolve({
      startBalancesTimer: () => {
        // Do nothing
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

  const renderWallet = async (): Promise<IcrcWalletPo> => {
    const { container } = render(IcrcWallet, props);
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
    vi.clearAllMocks();
    vi.clearAllTimers();
    tokensStore.reset();
    overrideFeatureFlagsStore.reset();
    resetIdentity();

    vi.mocked(icrcIndexApi.getTransactions).mockResolvedValue({
      transactions: [],
    });

    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
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
      const po = await renderWallet();
      expect(await po.hasSpinner()).toBe(true);
      resolveAccounts(mockCkETHMainAccount);
      await runResolvedPromises();
      expect(await po.hasSpinner()).toBe(false);
    });

    it("should call to load Icrc accounts", async () => {
      await renderWallet();
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
      const po = await renderWallet();

      expect(await po.getWalletPageHeaderPo().getUniverse()).toBe("ckETHTEST");
    });

    it("should render `Main` as subtitle", async () => {
      const po = await renderWallet();

      expect(await po.getWalletPageHeadingPo().getSubtitle()).toBe("Main");
    });

    it("should render a balance with token", async () => {
      const po = await renderWallet();

      expect(await po.getWalletPageHeadingPo().getTitle()).toBe(
        "11'112'222.33 ckETHTEST"
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

      // TODO GIX-2150: Vitest has issue evaluating a call to a function referenced by a component such as wallet.reloadAccount(). It evaluates the function to undefined. Not sure how to solve it on the test side.
      // const spy = vi.spyOn(services, "loadAccounts");

      await receiveModalPo.clickFinish();

      // await waitFor(() => expect(spy).toHaveBeenCalled());
    });
  });
});
