/**
 * @jest-environment jsdom
 */
import NotVotedNeuronsCard from "$lib/components/proposal-detail/NotVotedNeuronsCard.svelte";
import type { NeuronInfo, ProposalInfo } from "@dfinity/nns";
import { ProposalRewardStatus } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

describe("NotVotedNeuronsCard", () => {
  const proposalTimestampSeconds = BigInt(100);

  const proposalInfo = {
    ...mockProposalInfo,
    proposalTimestampSeconds,
    rewardStatus: ProposalRewardStatus.AcceptVotes,
  } as ProposalInfo;

  const neuron = {
    ...mockNeuron,
    createdTimestampSeconds: proposalTimestampSeconds + BigInt(1),
  } as NeuronInfo;

  it("should be hidden if no neurons", () => {
    const { container } = render(NotVotedNeuronsCard, {
      props: {
        proposalInfo,
        neurons: [],
      },
    });
    expect(container.querySelector("article")).not.toBeInTheDocument();
  });

  describe("ineligible", () => {
    it("should display texts", () => {
      const { getByText } = render(NotVotedNeuronsCard, {
        props: {
          proposalInfo,
          neurons: [
            {
              ...neuron,
              createdTimestampSeconds: proposalTimestampSeconds + BigInt(1),
            },
          ],
        },
      });
      expect(
        getByText(en.proposal_detail__ineligible.headline)
      ).toBeInTheDocument();
      expect(
        getByText(en.proposal_detail__ineligible.text)
      ).toBeInTheDocument();
    });

    it("should display ineligible neurons (< 6 months) ", () => {
      const { getByText } = render(NotVotedNeuronsCard, {
        props: {
          proposalInfo: { ...proposalInfo, ballots: [] },
          neurons: [
            {
              ...neuron,
              createdTimestampSeconds: proposalTimestampSeconds - BigInt(1),
              neuronId: BigInt(123),
            },
          ] as NeuronInfo[],
        },
      });
      expect(getByText("123", { exact: false })).toBeInTheDocument();
      expect(
        getByText(en.proposal_detail__ineligible.reason_short, { exact: false })
      ).toBeInTheDocument();
    });

    it("should display ineligible neurons (created after proposal) ", () => {
      const { getByText, container } = render(NotVotedNeuronsCard, {
        props: {
          proposalInfo: {
            ...proposalInfo,
            ballots: [],
          },
          neurons: [
            {
              ...neuron,
              neuronId: BigInt(111),
              createdTimestampSeconds: proposalTimestampSeconds + BigInt(1),
            },
          ] as NeuronInfo[],
        },
      });
      expect(getByText("111", { exact: false })).toBeInTheDocument();
      expect(
        (container.querySelector("small") as HTMLElement).textContent
      ).toEqual(en.proposal_detail__ineligible.reason_since);
    });

    it("should display multiple ineligible neurons", () => {
      const { container, getByText } = render(NotVotedNeuronsCard, {
        props: {
          proposalInfo: {
            ...proposalInfo,
            proposalTimestampSeconds,
            ballots: [],
          },
          neurons: [
            {
              ...neuron,
              neuronId: BigInt(111),
              createdTimestampSeconds: proposalTimestampSeconds + BigInt(1),
            },
            {
              ...neuron,
              neuronId: BigInt(222),
              createdTimestampSeconds: proposalTimestampSeconds,
            },
          ] as NeuronInfo[],
        },
      });
      expect(container.querySelectorAll("li").length).toBe(2);
      expect(
        (container.querySelector("small") as HTMLElement).textContent
      ).toEqual(en.proposal_detail__ineligible.reason_since);
      expect(
        getByText(en.proposal_detail__ineligible.reason_short, { exact: false })
      ).toBeInTheDocument();
    });
  });

  describe("settled", () => {
    it("should display texts", () => {
      const { getByText } = render(NotVotedNeuronsCard, {
        props: {
          proposalInfo: {
            ...proposalInfo,
            rewardStatus: ProposalRewardStatus.Settled,
          },
          neurons: [
            {
              ...neuron,
              createdTimestampSeconds: proposalTimestampSeconds + BigInt(1),
            },
          ],
        },
      });

      expect(
        getByText(en.proposal_detail__ineligible.text_settled)
      ).toBeInTheDocument();
    });

    it("should display proposal reward has settled", () => {
      const { getByText } = render(NotVotedNeuronsCard, {
        props: {
          proposalInfo: {
            ...proposalInfo,
            ballots: [],
            rewardStatus: ProposalRewardStatus.Settled,
          },
          neurons: [
            {
              ...neuron,
              createdTimestampSeconds: proposalTimestampSeconds - BigInt(1),
              neuronId: BigInt(123),
            },
          ] as NeuronInfo[],
        },
      });
      expect(getByText("123", { exact: false })).toBeInTheDocument();
      expect(
        getByText(en.proposal_detail__ineligible.reason_settled, {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });
});
