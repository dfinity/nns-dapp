/**
 * @jest-environment jsdom
 */
import { Vote } from "@dfinity/nns";
import type { RenderResult } from "@testing-library/svelte";
import { render } from "@testing-library/svelte";
import VotesCard from "../../../../lib/components/proposal-detail/VotesCard.svelte";
import { E8S_PER_ICP } from "../../../../lib/constants/icp.constants";
import { neuronsStore } from "../../../../lib/stores/neurons.store";
import { formatNumber } from "../../../../lib/utils/format.utils";
import { replacePlaceholders } from "../../../../lib/utils/i18n.utils";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

describe("VotesCard", () => {
  describe("Adopt-Reject section", () => {
    let renderResult: RenderResult;
    let yes: number, no: number;
    beforeEach(() => {
      neuronsStore.setNeurons({ neurons: [], certified: true });
      renderResult = render(VotesCard, {
        props: {
          proposalInfo: mockProposalInfo,
        },
      });

      yes = Number(mockProposalInfo.latestTally?.yes) / E8S_PER_ICP;
      no = Number(mockProposalInfo.latestTally?.no) / E8S_PER_ICP;
    });

    it('should render "Adopt" value', () => {
      const { getByText } = renderResult;
      expect(getByText(`${formatNumber(yes)}`)).toBeInTheDocument();
    });

    it('should render "Reject" value', () => {
      const { getByText } = renderResult;
      expect(getByText(`${formatNumber(no)}`)).toBeInTheDocument();
    });

    it("should render progressbar", () => {
      const { getByRole } = renderResult;
      const progressbar = getByRole("progressbar");
      expect(progressbar).toBeInTheDocument();
      expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
      expect(progressbar.getAttribute("aria-valuemax")).toBe(`${yes + no}`);
      expect(progressbar.getAttribute("aria-valuenow")).toBe(`${yes}`);
    });
  });

  describe("My Votes section", () => {
    const noVoted = {
      ...mockNeuron,
      neuronId: BigInt(100),
      recentBallots: [
        {
          proposalId: mockProposalInfo.id,
          vote: Vote.NO,
        },
      ],
    };
    const yesVoted = {
      ...mockNeuron,
      neuronId: BigInt(10),
      recentBallots: [
        {
          proposalId: mockProposalInfo.id,
          vote: Vote.YES,
        },
      ],
    };
    const votedNeurons = [mockNeuron, noVoted, yesVoted];
    const proposal = {
      ...mockProposalInfo,
      ballots: votedNeurons.map(({ neuronId, votingPower }) => ({
        neuronId,
        votingPower,
        vote: Vote.UNSPECIFIED,
      })),
    };
    it("should have title when proposal has been voted by some owned neuron", () => {
      neuronsStore.setNeurons({ neurons: votedNeurons, certified: true });
      const { getByText } = render(VotesCard, {
        props: {
          proposalInfo: proposal,
        },
      });
      expect(getByText(en.proposal_detail.my_votes)).toBeInTheDocument();
    });

    it("should not have title when proposal has not been voted by some owned neuron", () => {
      neuronsStore.setNeurons({ neurons: [], certified: true });
      const { getByText } = render(VotesCard, {
        props: {
          proposalInfo: proposal,
        },
      });
      expect(() => getByText(en.proposal_detail.my_votes)).toThrow();
    });

    it("should render an item per voted neuron", () => {
      neuronsStore.setNeurons({ neurons: votedNeurons, certified: true });
      const { container } = render(VotesCard, {
        props: {
          proposalInfo: proposal,
        },
      });
      const neuronElements = container.querySelectorAll(
        '[data-tid="neuron-data"]'
      );
      expect(neuronElements.length).toBe(2);
    });

    it("should render the proper icon item for YES and NO", () => {
      neuronsStore.setNeurons({ neurons: votedNeurons, certified: true });
      const { container } = render(VotesCard, {
        props: {
          proposalInfo: proposal,
        },
      });
      const thumbUpElements = container.querySelectorAll(
        '[data-tid="thumb-up"]'
      );
      expect(thumbUpElements.length).toBe(1);

      const thumbDownElements = container.querySelectorAll(
        '[data-tid="thumb-down"]'
      );
      expect(thumbDownElements.length).toBe(1);
    });

    it("should have title attribute per voted neuron for YES or NO", () => {
      neuronsStore.setNeurons({ neurons: votedNeurons, certified: true });
      const { getByTitle } = render(VotesCard, {
        props: {
          proposalInfo: proposal,
        },
      });

      expect(
        getByTitle(
          replacePlaceholders(en.proposal_detail__vote.vote_status, {
            $neuronId: noVoted.neuronId.toString(),
            $vote: en.core.no,
          })
        )
      ).toBeInTheDocument();

      expect(
        getByTitle(
          replacePlaceholders(en.proposal_detail__vote.vote_status, {
            $neuronId: yesVoted.neuronId.toString(),
            $vote: en.core.yes,
          })
        )
      ).toBeInTheDocument();
    });

    it("should have aria-label attribute", () => {
      neuronsStore.setNeurons({ neurons: votedNeurons, certified: true });
      const { container } = render(VotesCard, {
        props: {
          proposalInfo: proposal,
        },
      });
      const element = container.querySelector(`[data-tid="neuron-data"]`);

      expect(element).toBeInTheDocument();

      expect(element?.getAttribute("aria-label")).toBeTruthy();
    });
  });
});
