/**
 * @jest-environment jsdom
 */
import type { NeuronInfo, ProposalInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import IneligibleNeuronsCard from "../../../../lib/components/proposal-detail/IneligibleNeuronsCard.svelte";
import { neuronMock } from "../../../mocks/neurons.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

/* eslint-disable-next-line */
const en = require("../../../../lib/i18n/en.json");

const proposalTimestampSeconds = BigInt(100);
const proposalInfo = {
  ...mockProposalInfo,
  proposalTimestampSeconds,
} as ProposalInfo;
const ineligibleNeuron = {
  ...neuronMock,
  createdTimestampSeconds: proposalTimestampSeconds + BigInt(1),
} as NeuronInfo;

describe("IneligibleNeuronsCard", () => {
  it("should be hidden if no neurons", () => {
    const { container } = render(IneligibleNeuronsCard, {
      props: {
        proposalInfo,
        neurons: [],
      },
    });
    expect(container.querySelector("article")).not.toBeInTheDocument();
  });

  it("should display texts", () => {
    const { getByText } = render(IneligibleNeuronsCard, {
      props: {
        proposalInfo,
        neurons: [ineligibleNeuron],
      },
    });
    expect(
      getByText(en.proposal_detail__ineligible.headline)
    ).toBeInTheDocument();
    expect(getByText(en.proposal_detail__ineligible.text)).toBeInTheDocument();
  });

  it("should display ineligible neurons (< 6 months) ", () => {
    const { getByText } = render(IneligibleNeuronsCard, {
      props: {
        proposalInfo: { ...proposalInfo, ballots: [] },
        neurons: [
          {
            ...ineligibleNeuron,
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
    const { getByText } = render(IneligibleNeuronsCard, {
      props: {
        proposalInfo: { ...proposalInfo, ballots: [{ neuronId: BigInt(123) }] },
        neurons: [
          { ...ineligibleNeuron, neuronId: BigInt(123) },
        ] as NeuronInfo[],
      },
    });
    expect(getByText("123", { exact: false })).toBeInTheDocument();
    expect(
      getByText(en.proposal_detail__ineligible.reason_since, { exact: false })
    ).toBeInTheDocument();
  });

  it("should display multiple ineligible neurons", () => {
    const { container } = render(IneligibleNeuronsCard, {
      props: {
        proposalInfo: { ...proposalInfo, ballots: [] },
        neurons: [
          {
            ...ineligibleNeuron,
            neuronId: BigInt(123),
          },
          {
            ...ineligibleNeuron,
            neuronId: BigInt(321),
          },
        ] as NeuronInfo[],
      },
    });
    expect(container.querySelectorAll("li").length).toBe(2);
  });
});
