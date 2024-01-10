import SnsProposalVotingSection from "$lib/components/sns-proposals/SnsProposalVotingSection.svelte";
import { mapProposalInfo } from "$lib/utils/sns-proposals.utils";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { SnsProposalVotingSectionPo } from "$tests/page-objects/SnsProposalVotingSection.page-object";
import type { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsProposalData } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("SnsProposalVotingSection", () => {
  const proposal: SnsProposalData = {
    ...mockSnsProposal,
    latest_tally: [
      {
        ...fromDefinedNullable(mockSnsProposal.latest_tally),
        yes: 1_000_000_000n,
        no: 2_000_000_000n,
        total: 3_000_000_000n,
      },
    ],
    wait_for_quiet_state: [
      {
        current_deadline_timestamp_seconds: 10000n,
      },
    ],
  };
  const proposalDataMap = mapProposalInfo({
    proposalData: proposal,
    nsFunctions: [{ ...nervousSystemFunctionMock }],
  });
  const renderComponent = async (): Promise<VotesResultPo> => {
    const { container } = render(SnsProposalVotingSection, {
      props: {
        reloadProposal: () => {
          // do nothing
        },
        proposal: {
          ...proposal,
        },
        proposalDataMap,
      },
    });
    const containerPo = new JestPageObjectElement(container);
    const po = SnsProposalVotingSectionPo.under(containerPo);
    const votesResultsPo = await po.getVotingsResultsPo();
    return votesResultsPo;
  };

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(0);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should render vote results", async () => {
    const po = await renderComponent();

    expect(await po.isPresent()).toBeTruthy();
    expect(await po.getAdoptVotingPower()).toEqual(10);
    expect(await po.getRejectVotingPower()).toEqual(20);
  });

  it("should render expiration date", async () => {
    const po = await renderComponent();

    expect(await po.getExpirationDateText()).toEqual(
      "Expiration date 2 hours, 46 minutes remaining"
    );
  });
});
