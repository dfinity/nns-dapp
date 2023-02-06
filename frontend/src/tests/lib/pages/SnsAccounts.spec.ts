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
import { render, waitFor } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import { mockStoreSubscribe } from "../../mocks/commont.mock";
import en from "../../mocks/i18n.mock";
import { mockSnsAccountsStoreSubscribe } from "../../mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SnsAccounts", () => {
  const goToWallet = async () => {
    // Do nothing
  };

  describe("when there are accounts in the store", () => {
    beforeAll(() => {
      jest
        .spyOn(snsAccountsStore, "subscribe")
        .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));

      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

      jest
        .spyOn(snsProjectsCommittedStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

      page.mock({ data: { universe: mockPrincipal.toText() } });
    });

    it("should load accounts and transaction fee", () => {
      render(SnsAccounts, { props: { goToWallet } });

      expect(syncSnsAccounts).toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = render(SnsAccounts, { props: { goToWallet } });

      await waitFor(() =>
        expect(getByText(en.accounts.main)).toBeInTheDocument()
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = render(SnsAccounts, { props: { goToWallet } });

      await waitFor(() =>
        expect(getAllByTestId("account-card").length).toBeGreaterThan(0)
      );
    });

    it("should load sns accounts of the project", () => {
      render(SnsAccounts, { props: { goToWallet } });

      expect(syncSnsAccounts).toHaveBeenCalledWith({
        rootCanisterId: mockPrincipal,
      });
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
    it("should not render a token amount component nor zero", () => {
      const { container } = render(SnsAccounts, { props: { goToWallet } });

      // Tooltip wraps the amount
      expect(
        container.querySelector(".tooltip-wrapper")
      ).not.toBeInTheDocument();
    });
  });
});
