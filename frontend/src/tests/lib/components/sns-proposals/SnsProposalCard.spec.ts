import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
import { SECONDS_IN_HOUR } from "$lib/constants/constants";
import en from "$tests/mocks/i18n.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { SnsProposalData } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsProposalCard", () => {
  const props = { proposalData: mockSnsProposal, nsFunctions: [] };
  const now = 1689843195;
  const nowInSeconds = Math.ceil(now / 1000);
  beforeEach(() => {
    vi.clearAllTimers();
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

  it("should render a proposal status", () => {
    const { getByText } = render(SnsProposalCard, {
      props,
    });

    expect(getByText(en.sns_status["1"])).toBeInTheDocument();
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
      },
    });

    expect(queryByTestId("countdown").textContent).toBe("1 hour remaining");
  });

  it("should render a specific color for the status", () => {
    const proposalData: SnsProposalData = {
      ...mockSnsProposal,
      decided_timestamp_seconds: BigInt(2222),
      latest_tally: [
        {
          yes: BigInt(10),
          no: BigInt(3),
          total: BigInt(30),
          timestamp_seconds: BigInt(2222),
        },
      ],
      executed_timestamp_seconds: BigInt(nowInSeconds),
    };
    const { container } = render(SnsProposalCard, {
      props: {
        proposalData,
        nsFunctions: [],
      },
    });

    expect(container.querySelector(".success")).not.toBeNull();
  });
});
