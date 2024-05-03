import ActionableProposalCountBadge from "$lib/components/proposals/ActionableProposalCountBadge.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { mockUniverse } from "$tests/mocks/sns-projects.mock";
import { ActionableProposalCountBadgePo } from "$tests/page-objects/ActionableProposalCountBadge.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("ActionableProposalCountBadge", () => {
  const renderComponent = (props) => {
    const { container } = render(ActionableProposalCountBadge, {
      props,
    });

    return ActionableProposalCountBadgePo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render a proposal count", async () => {
    const po = renderComponent({ count: 5, universe: mockUniverse });
    expect(await po.isPresent()).toEqual(true);
    expect((await po.getText()).trim()).toEqual("5");
  });

  it("should have Sns tooltip", async () => {
    const po = renderComponent({ count: 5, universe: mockUniverse });
    expect(await po.getTooltipPo().isPresent()).toEqual(true);
    expect(await po.getTooltipPo().getTooltipText()).toEqual(
      "There are 5 Tetris proposals you can vote on."
    );
  });

  it("should have Nns tooltip", async () => {
    const po1 = renderComponent({
      count: 5,
      universe: {
        ...mockUniverse,
        canisterId: OWN_CANISTER_ID_TEXT,
      },
    });
    expect(await po1.getTooltipPo().getTooltipText()).toEqual(
      "There are 5 NNS proposals you can vote on."
    );
  });

  it("should have total tooltip", async () => {
    const po2 = renderComponent({
      count: 5,
      universe: "all",
    });
    expect(await po2.getTooltipPo().getTooltipText()).toEqual(
      "There are a total of 5 proposals you can vote on."
    );
  });

  it("should render different tooltip ids", async () => {
    const po = renderComponent({ count: 5, universe: mockUniverse });
    const po1 = renderComponent({ count: 6, universe: mockUniverse });

    expect(await po.getTooltipPo().getTooltipId()).not.toEqual(
      await po1.getTooltipPo().getTooltipId()
    );
  });
});
