/**
 * @jest-environment jsdom
 */
import SnsProposalVotingSection from "$lib/components/sns-proposals/SnsProposalVotingSection.svelte";
import { formatNumber } from "$lib/utils/format.utils";
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
    const { yes, no } = tally;
    const { container } = render(SnsProposalVotingSection, {
      props: {
        proposal: {
          ...proposal,
        },
      },
    });

    const containerPo = new JestPageObjectElement(container);
    const po = SnsProposalVotingSectionPo.under(containerPo);
    const votesResultsPo = await po.getVotingsResultsPo();

    expect(await votesResultsPo.isPresent()).toBeTruthy();
    expect(await votesResultsPo.getAdoptVotingPower()).toEqual(
      `${formatNumber(Number(yes))}`
    );
    expect(await votesResultsPo.getRejectVotingPower()).toEqual(
      `${formatNumber(Number(no))}`
    );
  });
});
