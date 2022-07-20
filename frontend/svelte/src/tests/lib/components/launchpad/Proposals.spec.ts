/**
 * @jest-environment jsdom
 */

import type { ProposalInfo } from "@dfinity/nns";
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

  afterAll(jest.clearAllMocks);

  it("should trigger listSnsProposals", () => {
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

  it("should proposal cards", async () => {
    mockProposals([{ ...mockProposalInfo }]);

    const { getAllByTestId } = render(Proposals);

    await waitFor(() =>
      expect(getAllByTestId("sns-proposal-card").length).toBeGreaterThan(0)
    );
  });

  it("should hide skeletons", async () => {
    mockProposals([{ ...mockProposalInfo }]);

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
