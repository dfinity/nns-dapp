/**
 * @jest-environment jsdom
 */
import SnsProposalVotingSection from "$lib/components/sns-proposals/SnsProposalVotingSection.svelte";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsProposalVotingSectionPo } from "$tests/page-objects/SnsProposalVotingSection.page-object";
import type { SnsProposalData } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("SnsProposalVotingSection", () => {
  const proposal: SnsProposalData = {
    ...mockSnsProposal,
  };

  it("should render vote results", async () => {
    const tally = fromDefinedNullable(mockSnsProposal.latest_tally);
    const { yes, total } = tally;
    const { container } = render(SnsProposalVotingSection, {
      props: {
        proposal: {
          ...proposal,
        },
      },
    });

    const containerPo = new JestPageObjectElement(container);
    const po = SnsProposalVotingSectionPo.under(containerPo);
    const votesResultPo = await po.getVotingsResultsPo();
    expect(await votesResultPo.isPresent()).toBeTruthy();

    expect(await votesResultPo.getProgressMinValue()).toBe(0n);
    expect(await votesResultPo.getProgressMaxValue()).toBe(total);
    expect(await votesResultPo.getProgressNowValue()).toBe(yes);
  });
});
