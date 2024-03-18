import SnsProposalsList from "$lib/components/sns-proposals/SnsProposalsList.svelte";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { SnsProposalData } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { beforeEach, describe } from "vitest";

describe("SnsProposalsList", () => {
  const proposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 1n }],
  };
  const proposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 2n }],
  };
  const proposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 3n }],
  };
  const proposals = [proposal1, proposal2, proposal3];

  beforeEach(() => {
    actionableProposalsSegmentStore.resetForTesting();
  });

  it("should render a proposal card per proposal", () => {
    const { queryAllByTestId } = render(SnsProposalsList, {
      props: {
        proposals,
        isActionable: false,
        nsFunctions: [],
      },
    });

    expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);
  });

  it("should render a spinner when loading next page", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals,
        isActionable: false,
        nsFunctions: [],
        loadingNextPage: true,
      },
    });

    expect(
      queryByTestId("next-page-sns-proposals-spinner")
    ).toBeInTheDocument();
  });

  it("should render a card skeletons if proposals are loading", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals: undefined,
        isActionable: false,
        nsFunctions: [],
      },
    });

    expect(queryByTestId("proposals-loading")).toBeInTheDocument();
  });

  it("should render no proposals found message if proposals is empty", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals: [],
        isActionable: false,
        nsFunctions: [],
      },
    });

    expect(queryByTestId("no-proposals-msg")).toBeInTheDocument();
  });

  describe("actionable proposals", () => {
    it("should render skeletons while proposals are loading", async () => {
      const { queryByTestId } = render(SnsProposalsList, {
        props: {
          proposals: undefined,
          isActionable: true,
          nsFunctions: [],
        },
      });

      expect(queryByTestId("proposals-loading")).toBeInTheDocument();
    });
  });
});
