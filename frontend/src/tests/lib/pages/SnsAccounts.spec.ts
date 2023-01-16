/**
 * @jest-environment jsdom
 */

import { committedProjectsStore } from "$lib/derived/projects.store";
import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
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
  mockSummary,
} from "../../mocks/sns-projects.mock";

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SnsAccounts", () => {
  describe("when there are accounts in the store", () => {
    beforeEach(() => {
      jest
        .spyOn(snsAccountsStore, "subscribe")
        .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));

      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject));

      jest
        .spyOn(committedProjectsStore, "subscribe")
        .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));

      page.mock({ data: { universe: mockPrincipal.toText() } });
    });

    it("should load accounts and transaction fee", () => {
      render(SnsAccounts);

      expect(syncSnsAccounts).toHaveBeenCalled();
    });

    it("should render a main Account", async () => {
      const { getByText } = render(SnsAccounts);

      await waitFor(() =>
        expect(getByText(en.accounts.main)).toBeInTheDocument()
      );
    });

    it("should render account cards", async () => {
      const { getAllByTestId } = render(SnsAccounts);

      await waitFor(() =>
        expect(getAllByTestId("account-card").length).toBeGreaterThan(0)
      );
    });

    it("should load sns accounts of the project", () => {
      render(SnsAccounts);

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
      const { container } = render(SnsAccounts);

      // Tooltip wraps the amount
      expect(
        container.querySelector(".tooltip-wrapper")
      ).not.toBeInTheDocument();
    });
  });

  describe("meta project", () => {
    beforeAll(() =>
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
      })
    );

    it("should render project title", async () => {
      const { getByText } = render(SnsAccounts);

      await waitFor(() =>
        expect(
          getByText(mockSnsFullProject.summary.metadata.name)
        ).toBeInTheDocument()
      );
    });

    it("should render sns project name", async () => {
      const { getByTestId } = render(SnsAccounts);

      const titleRow = getByTestId("projects-summary");

      expect(
        titleRow?.textContent?.includes(mockSummary.metadata.name)
      ).toBeTruthy();
    });

    it("should render sns project logo", async () => {
      const { getByTestId } = render(SnsAccounts);

      const logo = getByTestId("project-logo");
      const img = logo.querySelector('[data-tid="logo"]');

      expect(img?.getAttribute("src") ?? "").toEqual(mockSummary.metadata.logo);
    });
  });
});
