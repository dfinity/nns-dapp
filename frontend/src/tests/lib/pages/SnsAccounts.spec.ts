import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import * as workerBalances from "$lib/services/worker-balances.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import en from "$tests/mocks/i18n.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockSnsFullProject,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { render, waitFor, type RenderResult } from "@testing-library/svelte";
import type { ComponentProps } from "svelte";

vi.mock("$lib/services/sns-accounts.services");

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

describe("SnsAccounts", () => {
  const isLoading = (container: HTMLElement) => {
    const skeleton = container.querySelector(".skeleton-text");
    return nonNullish(skeleton);
  };

  const renderAndFinishLoading = async (
    props: ComponentProps<SnsAccounts>
  ): Promise<RenderResult<SnsAccounts>> => {
    const result = render(SnsAccounts, props);
    const { container } = result;
    // Make sure we detect loading correctly so we wait for the right thing below.
    expect(isLoading(container)).toBe(true);
    await waitFor(() => expect(isLoading(container)).toBe(false));
    return result;
  };

  const hasAmountRendered = (container: HTMLElement): boolean =>
    nonNullish(container.querySelector(".value"));

  beforeEach(() => {
    vi.clearAllMocks();
    snsAccountsStore.reset();
    vi.spyOn(tokensStore, "subscribe").mockImplementation(
      mockTokensSubscribe(mockUniversesTokens)
    );

    setSnsProjects([
      {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });
  });

  describe("when there are accounts in the store", () => {
    beforeEach(() => {
      snsAccountsStore.setAccounts({
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        accounts: [mockSnsMainAccount],
        certified: true,
      });
    });

    it("should load accounts and transaction fee", () => {
      render(SnsAccounts);

      expect(syncSnsAccounts).toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = await renderAndFinishLoading({});
      expect(getByText(en.accounts.main)).toBeInTheDocument();
    });

    it("should render balance in card", async () => {
      const { container } = await renderAndFinishLoading({});

      const cardTitleRow = container.querySelector(
        '[data-tid="account-card"] > div[data-tid="token-value-label"]'
      );

      expect(cardTitleRow?.textContent.trim()).toEqual(
        `${formatToken({
          value: mockSnsMainAccount.balanceE8s,
        })} ${mockSnsToken.symbol}`
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = await renderAndFinishLoading({});

      expect(getAllByTestId("account-card").length).toBeGreaterThan(0);
    });

    it("should load sns accounts of the project", () => {
      render(SnsAccounts);

      expect(syncSnsAccounts).toHaveBeenCalledWith({
        rootCanisterId: mockSnsFullProject.rootCanisterId,
      });
    });

    it("should render a token amount component", async () => {
      const { container } = await renderAndFinishLoading({});
      expect(hasAmountRendered(container)).toBe(true);
    });

    it("should init worker that sync the balance", async () => {
      const spy = vi.spyOn(workerBalances, "initBalancesWorker");

      render(SnsAccounts);

      await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    });
  });

  describe("when no accounts", () => {
    it("should not render a token amount component nor zero", async () => {
      const { container } = await renderAndFinishLoading({});
      expect(hasAmountRendered(container)).toBe(false);
    });
  });
});
