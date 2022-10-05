/**
 * @jest-environment jsdom
 */

import ProposalCard from "$lib/components/proposals/ProposalCard.svelte";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { authStore } from "$lib/stores/auth.store";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import { secondsToDuration } from "$lib/utils/date.utils";
import type { Proposal, ProposalInfo } from "@dfinity/nns";
import { GovernanceCanister, ProposalStatus, Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { MockGovernanceCanister } from "../../../mocks/governance.canister.mock";
import en from "../../../mocks/i18n.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("ProposalCard", () => {
  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render a proposal title", () => {
    const { getByText } = render(ProposalCard, {
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
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText(en.status.Open)).toBeInTheDocument();
  });

  it("should render a proposer", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${mockProposals[0].proposer}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal id", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${mockProposals[0].id}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal topic", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${en.topics[Topic[mockProposals[0].topic]]}`, { exact: false })
    ).toBeInTheDocument();
  });

  it("should render a proposal a type", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText(en.actions.RegisterKnownNeuron)).toBeInTheDocument();
  });

  it("should render deadline", () => {
    const { getByText } = render(ProposalCard, {
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
    const { container } = render(ProposalCard, {
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

    const { container } = render(ProposalCard, {
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
