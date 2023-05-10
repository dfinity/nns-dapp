import {
  snsProjectsAdoptedStore,
  snsProjectsCommittedStore,
} from "$lib/derived/sns/sns-projects.derived";
import Launchpad from "$lib/pages/Launchpad.svelte";
import { loadSnsSwapCommitments } from "$lib/services/sns.services";
import { authStore } from "$lib/stores/auth.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "$tests/mocks/sns-projects.mock";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

vi.mock("$lib/services/$public/sns.services", () => {
  return {
    loadProposalsSnsCF: vi.fn().mockResolvedValue(Promise.resolve()),
  };
});

vi.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSwapCommitments: vi.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("Launchpad", () => {
  describe("signed in", () => {
    vi.spyOn(authStore, "subscribe").mockImplementation(
      mutableMockAuthStoreSubscribe
    );

    beforeAll(() =>
      authStoreMock.next({
        identity: mockIdentity,
      })
    );

    afterEach(() => vi.clearAllMocks());

    it("should render titles", () => {
      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
        mockProjectSubscribe([mockSnsFullProject])
      );
      vi.spyOn(snsProjectsAdoptedStore, "subscribe").mockImplementation(
        mockProjectSubscribe([mockSnsFullProject])
      );
      const { getByText } = render(Launchpad);

      // TBU
      expect(getByText(en.sns_launchpad.open_projects)).toBeInTheDocument();
      expect(
        getByText(en.sns_launchpad.committed_projects)
      ).toBeInTheDocument();
      expect(getByText(en.sns_launchpad.upcoming_projects)).toBeInTheDocument();
      expect(getByText(en.sns_launchpad.proposals)).toBeInTheDocument();
    });

    it("should call loadSnsSwapCommitments", async () => {
      render(Launchpad);

      await waitFor(() => expect(loadSnsSwapCommitments).toHaveBeenCalled());
    });

    it("should not render upcoming projects title if no committed projects", () => {
      vi.spyOn(snsProjectsAdoptedStore, "subscribe").mockImplementation(
        mockProjectSubscribe([])
      );

      const { queryByText } = render(Launchpad);

      // TBU
      expect(queryByText(en.sns_launchpad.open_projects)).toBeInTheDocument();
      expect(
        queryByText(en.sns_launchpad.upcoming_projects)
      ).not.toBeInTheDocument();
      expect(queryByText(en.sns_launchpad.proposals)).toBeInTheDocument();
    });

    it("should not render committed project title if no committed projects", () => {
      vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
        mockProjectSubscribe([])
      );

      const { queryByText } = render(Launchpad);

      // TBU
      expect(queryByText(en.sns_launchpad.open_projects)).toBeInTheDocument();
      expect(
        queryByText(en.sns_launchpad.committed_projects)
      ).not.toBeInTheDocument();
      expect(queryByText(en.sns_launchpad.proposals)).toBeInTheDocument();
    });
  });

  describe("not logged in", () => {
    vi.spyOn(authStore, "subscribe").mockImplementation(
      mutableMockAuthStoreSubscribe
    );

    beforeAll(() =>
      authStoreMock.next({
        identity: undefined,
      })
    );
    it("should not call loadSnsSwapCommitments", async () => {
      render(Launchpad);

      await waitFor(() =>
        expect(loadSnsSwapCommitments).not.toHaveBeenCalled()
      );
    });
  });
});
