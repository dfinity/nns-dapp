import SnsProposalVotingSection from "$lib/components/sns-proposals/SnsProposalVotingSection.svelte";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { SnsProposalVotingSectionPo } from "$tests/page-objects/SnsProposalVotingSection.page-object";
import { VitestPageObjectElement } from "$tests/page-objects/vitest.page-object";
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
  };

  it("should render vote results", async () => {
    const { container } = render(SnsProposalVotingSection, {
      props: {
        reloadProposal: () => {
          // do nothing
        },
        proposal: {
          ...proposal,
        },
      },
    });

    const containerPo = new VitestPageObjectElement(container);
    const po = SnsProposalVotingSectionPo.under(containerPo);
    const votesResultsPo = await po.getVotingsResultsPo();

    expect(await votesResultsPo.isPresent()).toBeTruthy();
    expect(await votesResultsPo.getAdoptVotingPower()).toEqual("10.00");
    expect(await votesResultsPo.getRejectVotingPower()).toEqual("20.00");
  });
});
