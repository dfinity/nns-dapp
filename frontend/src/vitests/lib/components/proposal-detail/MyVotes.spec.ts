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

  it("should have title when proposal has been voted by some owned neuron", () => {
    const { getByText } = render(MyVotes, {
      props: {
        neuronsVotedForProposal,
      },
    });
    expect(getByText(en.proposal_detail.my_votes)).toBeInTheDocument();
  });

  it("should not have title when proposal has not been voted by some owned neuron", () => {
    const { getByText } = render(MyVotes, {
      props: {
        neuronsVotedForProposal: [],
      },
    });
    expect(() => getByText(en.proposal_detail.my_votes)).toThrow();
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
});
