import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCAccounts from "$lib/pages/CkBTCAccounts.svelte";
import { syncAccounts } from "$lib/services/wallet-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatTokenE8s } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/wallet-accounts.services", () => {
  return {
    syncAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    updateBalance: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-info.services", () => {
  return {
    loadCkBTCInfo: vi.fn().mockResolvedValue(undefined),
  };
});

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

describe("CkBTCAccounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(tokensStore, "subscribe").mockImplementation(
      mockTokensSubscribe(mockUniversesTokens)
    );

    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });
  });

  describe("when there are accounts in the store", () => {
    beforeEach(() => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });
    });

    it("should not load ckBTC accounts", () => {
      render(CkBTCAccounts);

      expect(syncAccounts).not.toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = render(CkBTCAccounts);

      await waitFor(() =>
        expect(getByText(en.accounts.main)).toBeInTheDocument()
      );
    });

    it("should render balance in card", async () => {
      const { container } = render(CkBTCAccounts);

      const cardTitleRow = container.querySelector(
        '[data-tid="account-card"] > div[data-tid="token-value-label"]'
      );

      expect(cardTitleRow?.textContent.trim()).toEqual(
        `${formatTokenE8s({
          value: mockCkBTCMainAccount.balanceUlps,
        })} ${mockCkBTCToken.symbol}`
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = render(CkBTCAccounts);

      await waitFor(() =>
        expect(getAllByTestId("account-card").length).toBeGreaterThan(0)
      );
    });
  });

  describe("when no accounts", () => {
    beforeEach(() => {
      icrcAccountsStore.reset();
    });

    it("should call load ckBTC accounts", () => {
      render(CkBTCAccounts);

      expect(syncAccounts).toHaveBeenCalled();
    });

    it("should render skeletons while loading", () => {
      const { container } = render(CkBTCAccounts);
      expect(
        container.querySelector('[data-tid="skeleton-card"]')
      ).not.toBeNull();
    });
  });
});
