import MyVotes from "$lib/components/proposal-detail/MyVotes.svelte";
import { replacePlaceholders } from "$lib/utils/i18n.utils";
import type { CompactNeuronInfo } from "$lib/utils/neuron.utils";
import en from "$tests/mocks/i18n.mock";
import { Vote } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("MyVotes", () => {
  const noVoted: CompactNeuronInfo = {
    idString: "100",
    votingPower: 100n,
    vote: Vote.No,
  };
  const yesVoted: CompactNeuronInfo = {
    idString: "200",
    votingPower: 200n,
    vote: Vote.Yes,
  };
  const neuronsVotedForProposal = [noVoted, yesVoted];

  it("should display voted neurons when proposal has been voted by some owned neuron", () => {
    const { queryAllByTestId } = render(MyVotes, {
      props: {
        neuronsVotedForProposal,
      },
    });
    expect(queryAllByTestId("neuron-data").length).toEqual(2);
  });

  it("should not have voted neurons when proposal has not been voted by some owned neuron", () => {
    const { queryAllByTestId } = render(MyVotes, {
      props: {
        neuronsVotedForProposal: [],
      },
    });
    expect(queryAllByTestId("neuron-data").length).toEqual(0);
  });

  it("should render an item per voted neuron", () => {
    const { container } = render(MyVotes, {
      props: {
        neuronsVotedForProposal,
      },
    });
    const neuronElements = container.querySelectorAll(
      '[data-tid="neuron-data"]'
    );
    expect(neuronElements.length).toBe(2);
  });

  it("should render the proper icon item for YES and NO", () => {
    const { container } = render(MyVotes, {
      props: {
        neuronsVotedForProposal,
      },
    });
    const thumbUpElements = container.querySelectorAll('[data-tid="thumb-up"]');
    expect(thumbUpElements.length).toBe(1);

    const thumbDownElements = container.querySelectorAll(
      '[data-tid="thumb-down"]'
    );
    expect(thumbDownElements.length).toBe(1);
  });

  it("should have title attribute per voted neuron for YES or NO", () => {
    const { getByTitle } = render(MyVotes, {
      props: {
        neuronsVotedForProposal,
      },
    });

    expect(
      getByTitle(
        replacePlaceholders(en.proposal_detail__vote.vote_status, {
          $neuronId: noVoted.idString,
          $vote: en.core.no,
        })
      )
    ).toBeInTheDocument();

    expect(
      getByTitle(
        replacePlaceholders(en.proposal_detail__vote.vote_status, {
          $neuronId: yesVoted.idString,
          $vote: en.core.yes,
        })
      )
    ).toBeInTheDocument();
  });

  it("should have aria-label attribute", () => {
    const { container } = render(MyVotes, {
      props: {
        neuronsVotedForProposal,
      },
    });
    const element = container.querySelector(`[data-tid="neuron-data"]`);

    expect(element).toBeInTheDocument();

    expect(element?.getAttribute("aria-label")).toBeTruthy();
  });

  it("should add colour class", () => {
    const rejectedVotedCount = (neurons: CompactNeuronInfo[]) =>
      render(MyVotes, {
        props: {
          neuronsVotedForProposal: neurons,
        },
      }).container.querySelectorAll(".rejected").length;

    expect(rejectedVotedCount([yesVoted])).toBe(0);
    expect(rejectedVotedCount([noVoted])).toBe(1);
  });
});
