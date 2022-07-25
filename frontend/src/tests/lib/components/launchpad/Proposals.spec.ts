/**
 * @jest-environment jsdom
 */

import { type ProposalInfo, ProposalStatus } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import Proposals from "../../../../lib/components/launchpad/Proposals.svelte";
import { listSnsProposals } from "../../../../lib/services/sns.services";
import { snsProposalsStore } from "../../../../lib/stores/projects.store";
import en from "../../../mocks/i18n.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    listSnsProposals: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("Proposals", () => {
  const mockProposals = (proposals: ProposalInfo[] | null) =>
    proposals === null
      ? snsProposalsStore.setLoadingState()
      : snsProposalsStore.setProposals({ proposals, certified: true });

  beforeEach(snsProposalsStore.reset);

  afterAll(jest.clearAllMocks);

  it("should trigger listSnsProposals", () => {
    render(Proposals);

    expect(listSnsProposals).toBeCalled();
  });

  it("should not trigger listSnsProposals if already loaded", () => {
    snsProposalsStore.setProposals({
      proposals: [],
      certified: true,
    });

    render(Proposals);

    expect(listSnsProposals).toBeCalled();
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
    mockProposals([{ ...mockProposalInfo, status: ProposalStatus.PROPOSAL_STATUS_OPEN }]);

    const { getAllByTestId } = render(Proposals);

    await waitFor(() =>
      expect(getAllByTestId("sns-proposal-card").length).toBeGreaterThan(0)
    );
  });

  it("should hide skeletons", async () => {
    mockProposals([{ ...mockProposalInfo, status: ProposalStatus.PROPOSAL_STATUS_OPEN }]);

    const { container, getAllByTestId } = render(Proposals);

    await waitFor(() =>
      expect(getAllByTestId("sns-proposal-card").length).toBeGreaterThan(0)
    );

    expect(container.querySelector('[data-tid="skeleton-card"]')).toBeNull();
  });

  it("should display no_message", async () => {
    mockProposals([]);

    const { queryByText } = render(Proposals);

    await waitFor(() =>
      expect(queryByText(en.voting.nothing_found)).toBeInTheDocument()
    );
  });
});
