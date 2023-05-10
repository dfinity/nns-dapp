import Proposals from "$lib/components/launchpad/Proposals.svelte";
import { loadProposalsSnsCF } from "$lib/services/$public/sns.services";
import { snsProposalsStore } from "$lib/stores/sns.store";
import en from "$tests/mocks/i18n.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { ProposalStatus, type ProposalInfo } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

vi.mock("$lib/services/$public/sns.services", () => {
  return {
    loadProposalsSnsCF: vi.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("Proposals", () => {
  const mockProposals = (proposals: ProposalInfo[] | null) =>
    proposals === null
      ? snsProposalsStore.reset()
      : snsProposalsStore.setProposals({ proposals, certified: true });

  beforeEach(snsProposalsStore.reset);

  afterAll(vi.clearAllMocks);

  it("should trigger loadProposalsSnsCF", () => {
    render(Proposals);

    expect(loadProposalsSnsCF).toBeCalled();
  });

  it("should not trigger loadProposalsSnsCF if already loaded", () => {
    snsProposalsStore.setProposals({
      proposals: [],
      certified: true,
    });

    render(Proposals);

    expect(loadProposalsSnsCF).toBeCalled();
  });

  it("should display skeletons", async () => {
    mockProposals(null);

    const { container } = render(Proposals);

    await waitFor(() =>
      expect(
        container.querySelector('[data-tid="skeleton-card"]')
      ).toBeInTheDocument()
    );
  });

  it("should display proposal cards", async () => {
    mockProposals([{ ...mockProposalInfo, status: ProposalStatus.Open }]);

    const { queryAllByTestId } = render(Proposals);

    await waitFor(() =>
      expect(queryAllByTestId("proposal-card").length).toBeGreaterThan(0)
    );
  });

  it("should hide skeletons", async () => {
    mockProposals([{ ...mockProposalInfo, status: ProposalStatus.Open }]);

    const { container } = render(Proposals);

    await waitFor(() =>
      expect(
        container.querySelectorAll('[data-tid="proposal-card"]').length
      ).toBeGreaterThan(0)
    );

    expect(container.querySelector('[data-tid="skeleton-card"]')).toBeNull();
  });

  it("should display no_message", async () => {
    mockProposals([]);

    const { queryByText } = render(Proposals);

    await waitFor(() =>
      expect(queryByText(en.sns_launchpad.no_proposals)).toBeInTheDocument()
    );
  });
});
