import SelectActionableCard from "$lib/components/universe/SelectActionableCard.svelte";
import { actionableProposalTotalCountStore } from "$lib/derived/actionable-proposals.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { SelectActionableCardPo } from "$tests/page-objects/SelectActionableCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { ProposalInfo } from "@dfinity/nns";
import { get } from "svelte/store";
import { describe } from "vitest";

describe("SelectActionableCard", () => {
  const renderComponent = async (props) => {
    const { container } = render(SelectActionableCard, props);
    await runResolvedPromises();
    return SelectActionableCardPo.under(new JestPageObjectElement(container));
  };

  it("display a selected card", async () => {
    const po = await renderComponent({
      props: { selected: true },
    });
    expect(await po.isSelected()).toBe(true);

    const po1 = await renderComponent({
      props: { selected: false },
    });
    expect(await po1.isSelected()).toBe(false);
  });

  // display a total count
  it("display a total count", async () => {
    const nnsProposals: ProposalInfo[] = [
      {
        ...mockProposalInfo,
        id: 0n,
      },
      {
        ...mockProposalInfo,
        id: 1n,
      },
    ];
    expect(get(actionableProposalTotalCountStore)).toEqual(0);

    actionableNnsProposalsStore.setProposals(nnsProposals);

    expect(get(actionableProposalTotalCountStore)).toEqual(nnsProposals.length);
  });
});
