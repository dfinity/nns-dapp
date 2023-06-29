/**
 * @jest-environment jsdom
 */

import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import * as workerBalances from "$lib/services/worker-balances.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { mockStoreSubscribe } from "$tests/mocks/commont.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockSnsFullProject,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { nonNullish } from "@dfinity/utils";
import { render, waitFor, type RenderResult } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import type { ComponentProps } from "svelte/types/runtime";

jest.mock("$lib/services/sns-accounts.services");

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

describe("SnsAccounts", () => {
  const goToWallet = async () => {
    // Do nothing
  };

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
    jest.clearAllMocks();

    jest
      .spyOn(tokensStore, "subscribe")
      .mockImplementation(mockTokensSubscribe(mockUniversesTokens));

    snsQueryStore.reset();
    snsQueryStore.setData(
      snsResponseFor({
        principal: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      })
    );
  });

  describe("when there are accounts in the store", () => {
    beforeEach(() => {
      snsAccountsStore.reset();
      snsAccountsStore.setAccounts({
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        accounts: [mockSnsMainAccount],
        certified: true,
      });

      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
      });
    });

    it("should load accounts and transaction fee", () => {
      render(SnsAccounts, { goToWallet });

      expect(syncSnsAccounts).toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = await renderAndFinishLoading({ goToWallet });
      expect(getByText(en.accounts.main)).toBeInTheDocument();
    });

    it("should render balance in card", async () => {
      const { container } = await renderAndFinishLoading({ goToWallet });

      const cardTitleRow = container.querySelector(
        'article > div[data-tid="token-value-label"]'
      );

      expect(cardTitleRow?.textContent.trim()).toEqual(
        `${formatToken({
          value: mockSnsMainAccount.balanceE8s,
        })} ${mockSnsToken.symbol}`
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = await renderAndFinishLoading({ goToWallet });

      expect(getAllByTestId("account-card").length).toBeGreaterThan(0);
    });

    it("should load sns accounts of the project", () => {
      render(SnsAccounts, { goToWallet });

      expect(syncSnsAccounts).toHaveBeenCalledWith({
        rootCanisterId: mockSnsFullProject.rootCanisterId,
      });
    });

    it("should render a token amount component", async () => {
      const { container } = await renderAndFinishLoading({ goToWallet });
      expect(hasAmountRendered(container)).toBe(true);
    });

    it("should init worker that sync the balance", async () => {
      const spy = jest.spyOn(workerBalances, "initBalancesWorker");

      render(SnsAccounts, { goToWallet });

      await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    });
  });

  describe("when no accounts", () => {
    beforeEach(() => {
      jest
        .spyOn(snsProjectAccountsStore, "subscribe")
        .mockImplementation((run: Subscriber<undefined>): (() => void) => {
          run(undefined);
          return () => undefined;
        });
    });

    it("should not render a token amount component nor zero", async () => {
      const { container } = await renderAndFinishLoading({ goToWallet });
      expect(hasAmountRendered(container)).toBe(false);
    });
  });
});
