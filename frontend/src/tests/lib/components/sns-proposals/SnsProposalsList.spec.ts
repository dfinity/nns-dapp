import SnsProposalsList from "$lib/components/sns-proposals/SnsProposalsList.svelte";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { SnsProposalData } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsProposalsList", () => {
  const proposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(1) }],
  };
  const proposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(2) }],
  };
  const proposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: BigInt(3) }],
  };
  const proposals = [proposal1, proposal2, proposal3];

  it("should render a proposal card per proposal", () => {
    const { queryAllByTestId } = render(SnsProposalsList, {
      props: {
        proposals,
        nsFunctions: [],
      },
    });

    expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);
  });

  it("should render a spinner when loading next page", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals,
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
        nsFunctions: [],
      },
    });

    expect(queryByTestId("proposals-loading")).toBeInTheDocument();
  });

  it("should render no proposals found message if proposals is empty", () => {
    const { queryByTestId } = render(SnsProposalsList, {
      props: {
        proposals: [],
        nsFunctions: [],
      },
    });

    expect(queryByTestId("no-proposals-msg")).toBeInTheDocument();
  });
});
