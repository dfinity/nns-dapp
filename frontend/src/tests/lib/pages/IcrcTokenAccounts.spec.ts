import {
  CKETHSEPOLIA_INDEX_CANISTER_ID,
  CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
} from "$lib/constants/cketh-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import IcrcTokenAccounts from "$lib/pages/IcrcTokenAccounts.svelte";
import { syncAccounts } from "$lib/services/wallet-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { icrcCanistersStore } from "$lib/stores/icrc-canisters.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatTokenV2 } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import {
  mockCkETHMainAccount,
  mockCkETHTESTToken,
} from "$tests/mocks/cketh-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { TokenAmountV2 } from "@dfinity/utils";
import { render, waitFor } from "@testing-library/svelte";

vi.mock("$lib/services/wallet-accounts.services", () => {
  return {
    syncAccounts: vi.fn().mockResolvedValue(undefined),
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

describe("IcrcTokenAccounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(tokensStore, "subscribe").mockImplementation(
      mockTokensSubscribe(mockUniversesTokens)
    );

    page.mock({
      data: { universe: CKETHSEPOLIA_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    icrcCanistersStore.setCanisters({
      ledgerCanisterId: CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
      indexCanisterId: CKETHSEPOLIA_INDEX_CANISTER_ID,
    });
  });

  describe("when there are accounts in the store", () => {
    beforeEach(() => {
      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkETHMainAccount],
          certified: true,
        },
        universeId: CKETHSEPOLIA_UNIVERSE_CANISTER_ID,
      });
    });

    it("should not load Icrc accounts", () => {
      render(IcrcTokenAccounts);

      expect(syncAccounts).not.toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = render(IcrcTokenAccounts);

      await waitFor(() =>
        expect(getByText(en.accounts.main)).toBeInTheDocument()
      );
    });

    it("should render balance in card", async () => {
      const { container } = render(IcrcTokenAccounts);

      const cardTitleRow = container.querySelector(
        '[data-tid="account-card"] > div[data-tid="token-value-label"]'
      );

      expect(cardTitleRow?.textContent.trim()).toEqual(
        `${formatTokenV2({
          value: TokenAmountV2.fromUlps({
            amount: mockCkETHMainAccount.balanceE8s,
            token: mockCkETHTESTToken,
          }),
        })} ${mockCkETHTESTToken.symbol}`
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = render(IcrcTokenAccounts);

      await waitFor(() =>
        expect(getAllByTestId("account-card").length).toBeGreaterThan(0)
      );
    });
  });

  describe("when no accounts", () => {
    beforeEach(() => {
      icrcAccountsStore.reset();
    });

    it("should call load accounts", () => {
      render(IcrcTokenAccounts);

      // TODO: this should assert that the API are called https://dfinity.atlassian.net/browse/GIX-2150
      expect(syncAccounts).toHaveBeenCalled();
    });

    it("should render skeletons while loading", () => {
      const { container } = render(IcrcTokenAccounts);
      expect(
        container.querySelector('[data-tid="skeleton-card"]')
      ).not.toBeNull();
    });
  });
});
