import SnsProposalCard from "$lib/components/sns-proposals/SnsProposalCard.svelte";
import { SECONDS_IN_HOUR } from "$lib/constants/constants";
import { nowInSeconds } from "$lib/utils/date.utils";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { subaccountToHexString } from "$lib/utils/sns-neuron.utils";
import en from "$tests/mocks/i18n.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { SnsProposalData } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsProposalCard", () => {
  const props = { proposalData: mockSnsProposal, nsFunctions: [] };
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

  it("should render a proposer", () => {
    const { getByText } = render(SnsProposalCard, {
      props,
    });

    const proposerString = shortenWithMiddleEllipsis(
      subaccountToHexString(mockSnsProposal.proposer[0]?.id)
    );
    expect(getByText(proposerString, { exact: false })).toBeInTheDocument();
  });

  it("should render a proposal id", () => {
    const { queryAllByText } = render(SnsProposalCard, {
      props,
    });

    expect(
      queryAllByText(String(mockSnsProposal.id[0]?.id), { exact: false }).length
    ).toBeGreaterThan(0);
  });

  it("should render a proposal topic", () => {
    const nsFunctions = [nervousSystemFunctionMock];
    const proposalData = {
      ...mockSnsProposal,
      action: nervousSystemFunctionMock.id,
    };
    const { getByText } = render(SnsProposalCard, {
      props: {
        proposalData,
        nsFunctions,
      },
    });

    expect(getByText(nervousSystemFunctionMock.name)).toBeInTheDocument();
  });

  // TODO: fix this test after rebasing main with https://github.com/dfinity/nns-dapp/pull/1689
  xit("should render deadline", () => {
    const proposalData: SnsProposalData = {
      ...mockSnsProposal,
      wait_for_quiet_state: [
        {
          current_deadline_timestamp_seconds: BigInt(
            nowInSeconds() + SECONDS_IN_HOUR
          ),
        },
      ],
    };
    render(SnsProposalCard, {
      props: {
        proposalData,
        nsFunctions: [],
      },
    });
  });

  it("should not render accessible labels", () => {
    const { container } = render(SnsProposalCard, {
      props,
    });

    expect(
      container.querySelector(`[aria-label="${en.proposal_detail.id_prefix}"]`)
    ).toBeInTheDocument();
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
      executed_timestamp_seconds: BigInt(nowInSeconds()),
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
