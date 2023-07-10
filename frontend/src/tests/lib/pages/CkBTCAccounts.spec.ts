import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import CkBTCAccounts from "$lib/pages/CkBTCAccounts.svelte";
import { syncCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatToken } from "$lib/utils/token.utils";
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
import { vi } from "vitest";
import { page } from "../../../../__mocks__/$app/stores";

vi.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    syncCkBTCAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/ckbtc-withdrawal-accounts.services", () => {
  return {
    loadCkBTCWithdrawalAccount: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    updateBalance: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/ckbtc-info.services", () => {
  return {
    loadCkBTCInfo: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/worker-balances.services", () => ({
  initBalancesWorker: jest.fn(() =>
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
  const goToWallet = async () => {
    // Do nothing
  };

  beforeAll(() => {
    jest
      .spyOn(tokensStore, "subscribe")
      .mockImplementation(mockTokensSubscribe(mockUniversesTokens));

    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });
  });

  describe("when there are accounts in the store", () => {
    beforeAll(() => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });
    });

    it("should not load ckBTC accounts", () => {
      render(CkBTCAccounts, { props: { goToWallet } });

      expect(syncCkBTCAccounts).not.toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = render(CkBTCAccounts, { props: { goToWallet } });

      await waitFor(() =>
        expect(getByText(en.accounts.main)).toBeInTheDocument()
      );
    });

    it("should render balance in card", async () => {
      const { container } = render(CkBTCAccounts, { props: { goToWallet } });

      const cardTitleRow = container.querySelector(
        'article > div[data-tid="token-value-label"]'
      );

      expect(cardTitleRow?.textContent.trim()).toEqual(
        `${formatToken({
          value: mockCkBTCMainAccount.balanceE8s,
        })} ${mockCkBTCToken.symbol}`
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = render(CkBTCAccounts, {
        props: { goToWallet },
      });

      await waitFor(() =>
        expect(getAllByTestId("account-card").length).toBeGreaterThan(0)
      );
    });
  });

  describe("when no accounts", () => {
    beforeAll(() => {
      icrcAccountsStore.reset();
    });

    it("should call load ckBTC accounts", () => {
      render(CkBTCAccounts, { props: { goToWallet } });

      expect(syncCkBTCAccounts).toHaveBeenCalled();
    });

    it("should render skeletons while loading", () => {
      const { container } = render(CkBTCAccounts, { props: { goToWallet } });
      expect(
        container.querySelector('[data-tid="skeleton-card"]')
      ).not.toBeNull();
    });
  });
});
