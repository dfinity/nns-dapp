import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
import { SECONDS_IN_HOUR } from "$lib/constants/constants";
import en from "$tests/mocks/i18n.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  createSnsProposal,
  mockSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import { mockSnsCanisterIdText } from "$tests/mocks/sns.api.mock";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  type SnsProposalData,
} from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsProposalCard", () => {
  const props = {
    proposalData: mockSnsProposal,
    nsFunctions: [],
    rootCanisterId: mockSnsCanisterIdText,
  };
  const now = 1698139468000;
  const nowInSeconds = Math.ceil(now / 1000);
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
  });

  it("should render a proposal title", () => {
    const { getByText } = render(SnsProposalCard, {
      props,
    });

    expect(
      getByText(mockSnsProposal.proposal[0].title as string)
    ).toBeInTheDocument();
  });

  it("should render a function name as heading", () => {
    const { queryByTestId } = render(SnsProposalCard, {
      props: {
        proposalData: {
          ...mockSnsProposal,
          action: nervousSystemFunctionMock.id,
        },
        nsFunctions: [nervousSystemFunctionMock],
        rootCanisterId: mockSnsCanisterIdText,
      },
    });

    expect(queryByTestId("proposal-card-heading").textContent).toBe(
      nervousSystemFunctionMock.name
    );
  });

  it("should render a proposal status", () => {
    const { getByText } = render(SnsProposalCard, {
      props,
    });

    expect(getByText(en.sns_status["1"])).toBeInTheDocument();
  });

  it("should not render topic key", () => {
    const { queryByTestId } = render(SnsProposalCard, {
      props,
    });

    expect(queryByTestId("proposal-topic")).not.toBeInTheDocument();
  });

  it("should render a proposal id", () => {
    const { queryAllByText } = render(SnsProposalCard, {
      props,
    });

    expect(
      queryAllByText(String(mockSnsProposal.id[0]?.id), { exact: false }).length
    ).toBeGreaterThan(0);
  });

  it("should render deadline", () => {
    const proposalData: SnsProposalData = {
      ...mockSnsProposal,
      wait_for_quiet_state: [
        {
          current_deadline_timestamp_seconds: BigInt(
            nowInSeconds + SECONDS_IN_HOUR
          ),
        },
      ],
    };
    const { queryByTestId } = render(SnsProposalCard, {
      props: {
        proposalData,
        nsFunctions: [],
        rootCanisterId: mockSnsCanisterIdText,
      },
    });

    expect(queryByTestId("countdown").textContent).toBe("1 hour remaining");
  });

  it("should not render deadline if closed", () => {
    const proposalData: SnsProposalData = createSnsProposal({
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
      rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED,
      proposalId: 123n,
    });
    const { queryByTestId } = render(SnsProposalCard, {
      props: {
        proposalData,
        nsFunctions: [],
        rootCanisterId: mockSnsCanisterIdText,
      },
    });

    expect(queryByTestId("countdown")).not.toBeInTheDocument();
  });

  it("should render a specific color for the status", () => {
    const proposalData: SnsProposalData = {
      ...mockSnsProposal,
      decided_timestamp_seconds: 2_222n,
      latest_tally: [
        {
          yes: 10n,
          no: 3n,
          total: 30n,
          timestamp_seconds: 2_222n,
        },
      ],
      executed_timestamp_seconds: BigInt(nowInSeconds),
    };
    const { container } = render(SnsProposalCard, {
      props: {
        proposalData,
        nsFunctions: [],
        rootCanisterId: mockSnsCanisterIdText,
      },
    });

    expect(container.querySelector(".executed")).not.toBeNull();
  });

  it("should use provided rootCanisterId for a link", () => {
    const { getByTestId } = render(SnsProposalCard, {
      props: {
        ...props,
        proposalData: {
          ...mockSnsProposal,
          id: [
            {
              id: 77n,
            },
          ],
        },
        rootCanisterId: "aaaaa-aa",
      },
    });

    expect(getByTestId("proposal-card").getAttribute("href")).toEqual(
      "/proposal/?u=aaaaa-aa&proposal=77"
    );
  });
});
