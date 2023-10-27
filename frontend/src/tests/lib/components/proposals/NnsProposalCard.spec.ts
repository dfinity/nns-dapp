import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
import { DEFAULT_PROPOSALS_FILTERS } from "$lib/constants/proposals.constants";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import { secondsToDuration } from "$lib/utils/date.utils";
import en from "$tests/mocks/i18n.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import {
  NnsFunction,
  ProposalStatus,
  type Proposal,
  type ProposalInfo,
} from "@dfinity/nns";
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

  it("should render the proposal nns execute function name as title for ExecuteNnsFunction actions", () => {
    const { queryByTestId } = render(NnsProposalCard, {
      props: {
        proposalInfo: {
          ...mockProposals[0],
          proposal: {
            ...mockProposals[0].proposal,
            action: {
              ExecuteNnsFunction: {
                nnsFunctionId: NnsFunction.NnsCanisterUpgrade,
              },
            },
          },
        },
      },
    });

    expect(queryByTestId("proposal-card-heading").textContent).toBe(
      "NNS Canister Upgrade"
    );
  });

  it("should render the proposal action key as title if not ExecuteNnsFunction action", () => {
    const { queryByTestId } = render(NnsProposalCard, {
      props: {
        proposalInfo: {
          ...mockProposals[0],
          proposal: {
            ...mockProposals[0].proposal,
            action: {
              RegisterKnownNeuron: {
                id: [{ id: BigInt(1) }],
                known_neuron_data: [
                  {
                    name: "test",
                    description: [],
                  },
                ],
              },
            },
          },
        },
      },
    });

    expect(queryByTestId("proposal-card-heading").textContent).toBe(
      "Register Known Neuron"
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
      BigInt(nowInSeconds);

    const text = `${secondsToDuration(durationTillDeadline)} ${
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

    expect(container.querySelector(".success")).not.toBeNull();

    proposalsFiltersStore.filterStatus(DEFAULT_PROPOSALS_FILTERS.status);
  });
});
