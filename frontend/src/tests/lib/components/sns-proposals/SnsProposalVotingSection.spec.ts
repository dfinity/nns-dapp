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
    latest_tally: [
      {
        ...fromDefinedNullable(mockSnsProposal.latest_tally),
        yes: 10n,
        no: 20n,
      },
    ],
  };

  it("should render vote results", async () => {
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
    expect(await votesResultsPo.getAdoptVotingPower()).toEqual("10.00");
    expect(await votesResultsPo.getRejectVotingPower()).toEqual("20.00");
  });
});
