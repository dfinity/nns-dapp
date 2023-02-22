/**
 * @jest-environment jsdom
 */

import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
import SnsAccounts from "$lib/pages/SnsAccounts.svelte";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { page } from "$mocks/$app/stores";
import { nonNullish } from "@dfinity/utils";
import { render, waitFor, type RenderResult } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import type { ComponentProps } from "svelte/types/runtime";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { mockStoreSubscribe } from "../../mocks/commont.mock";
import en from "../../mocks/i18n.mock";
import { mockSnsMainAccount } from "../../mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/sns-accounts.services");

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

  describe("when there are accounts in the store", () => {
    beforeEach(() => {
      snsAccountsStore.reset();
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts: [mockSnsMainAccount],
        certified: true,
      });

      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

      jest
        .spyOn(snsProjectsCommittedStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

      page.mock({ data: { universe: mockPrincipal.toText() } });
    });

    it("should load accounts and transaction fee", () => {
      render(SnsAccounts, { goToWallet });

      expect(syncSnsAccounts).toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = await renderAndFinishLoading({ goToWallet });
      expect(getByText(en.accounts.main)).toBeInTheDocument();
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = await renderAndFinishLoading({ goToWallet });

      expect(getAllByTestId("account-card").length).toBeGreaterThan(0);
    });

    it("should load sns accounts of the project", () => {
      render(SnsAccounts, { goToWallet });

      expect(syncSnsAccounts).toHaveBeenCalledWith({
        rootCanisterId: mockPrincipal,
      });
    });

    it("should render a token amount component", async () => {
      const { container } = await renderAndFinishLoading({ goToWallet });
      expect(hasAmountRendered(container)).toBe(true);
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
