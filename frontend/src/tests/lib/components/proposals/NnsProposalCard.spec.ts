import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import { secondsToDuration } from "$lib/utils/date.utils";
import en from "$tests/mocks/i18n.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import type { Proposal, ProposalInfo } from "@dfinity/nns";
import { ProposalStatus, Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsProposalCard", () => {
  it("should render a proposal title", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    const firstProposal = mockProposals[0] as ProposalInfo;
    expect(
      getByText((firstProposal.proposal as Proposal).title as string)
    ).toBeInTheDocument();
  });

  it("should render a proposal status", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText(en.status.Open)).toBeInTheDocument();
  });

  it("should render a proposer", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${mockProposals[0].proposer}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal id", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${mockProposals[0].id}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal topic", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${en.topics[Topic[mockProposals[0].topic]]}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal a type", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText(en.actions.RegisterKnownNeuron)).toBeInTheDocument();
  });

  it("should render deadline", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    const durationTillDeadline =
      (mockProposals[0].deadlineTimestampSeconds as bigint) -
      BigInt(Math.round(Date.now() / 1000));

    const text = `${secondsToDuration(durationTillDeadline)} ${
      en.proposal_detail.remaining
    }`;

    expect(getByText(text)).toBeInTheDocument();
  });

  it("should render accessible info without label", () => {
    const { container } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      container.querySelector(`[aria-label="${en.proposal_detail.id_prefix}"]`)
    ).not.toBeNull();
    expect(
      container.querySelector(
        `[aria-label="${en.proposal_detail.type_prefix}"]`
      )
    ).not.toBeNull();
  });

  it("should render a specific color for the status", () => {
    proposalsFiltersStore.filterStatus([
      ...DEFAULT_PROPOSALS_FILTERS.status,
      ProposalStatus.Executed,
    ]);

    const { container } = render(NnsProposalCard, {
      props: {
        proposalInfo: {
          ...mockProposals[1],
          status: ProposalStatus.Executed,
        },
      },
    });

    expect(container.querySelector(".success")).not.toBeNull();

    proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
  });
});
