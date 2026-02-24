import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import en from "$tests/mocks/i18n.mock";
import { createMockProposalInfo } from "$tests/mocks/proposal.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { secondsToDuration } from "@dfinity/utils";
import {
  ProposalStatus,
  Topic,
  type Action,
  type Proposal,
  type ProposalInfo,
} from "@icp-sdk/canisters/nns";
import { render } from "@testing-library/svelte";

describe("NnsProposalCard", () => {
  const nowInSeconds = 1689843195;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(nowInSeconds * 1000);
  });

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

  it("should render the proposal type from selfDescribingAction for ExecuteNnsFunction actions", () => {
    const { queryByTestId } = render(NnsProposalCard, {
      props: {
        proposalInfo: {
          ...createMockProposalInfo({ action: {} as Action }),
          proposal: {
            ...createMockProposalInfo({ action: {} as Action }).proposal,
            selfDescribingAction: {
              typeName: "NnsCanisterUpgrade",
              typeDescription: "Upgrade an NNS canister",
              value: undefined,
            },
          },
        },
      },
    });

    expect(queryByTestId("proposal-card-heading").textContent).toBe(
      "NnsCanisterUpgrade"
    );
  });

  it("should render the proposal type from selfDescribingAction", () => {
    const { queryByTestId } = render(NnsProposalCard, {
      props: {
        proposalInfo: {
          ...createMockProposalInfo({ action: {} as Action }),
          proposal: {
            ...createMockProposalInfo({ action: {} as Action }).proposal,
            selfDescribingAction: {
              typeName: "RegisterKnownNeuron",
              typeDescription: "Register a known neuron",
              value: undefined,
            },
          },
        },
      },
    });

    expect(queryByTestId("proposal-card-heading").textContent).toBe(
      "RegisterKnownNeuron"
    );
  });

  it("should render a proposal status", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText(en.status.Open)).toBeInTheDocument();
  });

  it("should render a proposal topic", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(
      getByText(`${en.topics[Topic[mockProposals[0].topic]]}`, {
        exact: false,
      })
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

  it("should render a proposal a type", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    expect(getByText("RegisterKnownNeuron")).toBeInTheDocument();
  });

  it("should render deadline", () => {
    const { getByText } = render(NnsProposalCard, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    const durationTillDeadline =
      (mockProposals[0].deadlineTimestampSeconds as bigint) -
      BigInt(nowInSeconds);

    const text = `${secondsToDuration({ seconds: durationTillDeadline })} ${
      en.proposal_detail.remaining
    }`;

    expect(getByText(text)).toBeInTheDocument();
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

    expect(container.querySelector(".executed")).not.toBeNull();

    proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
  });
});
