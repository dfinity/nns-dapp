import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
import { PageBannerPo } from "$tests/page-objects/PageBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("ActionableProposalsEmpty", () => {
  const renderComponent = () => {
    const { container } = render(ActionableProposalsEmpty);

    return PageBannerPo.under({
      element: new JestPageObjectElement(container),
      testId: "actionable-proposals-empty",
    });
  };

  it("should display a title", async () => {
    const po = renderComponent();
    expect(await po.getTitleText()).toEqual("You're all caught up.");
  });

  it("should display a description", async () => {
    const po = renderComponent();
    expect(await po.getDescriptionText()).toEqual("Check back later!");
  });
});
