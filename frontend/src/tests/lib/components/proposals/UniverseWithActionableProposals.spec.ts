import { mockUniverse } from "$tests/mocks/sns-projects.mock";
import { UniverseWithActionableProposalsPo } from "$tests/page-objects/UniverseWithActionableProposals.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import UniverseWithActionableProposalsTest from "./UniverseWithActionableProposalsTest.svelte";

describe("UniverseWithActionableProposals", () => {
  const renderComponent = (props) => {
    const { container } = render(UniverseWithActionableProposalsTest, {
      props,
    });

    return UniverseWithActionableProposalsPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should render a title", async () => {
    const po = renderComponent({
      universe: { ...mockUniverse, title: "Universe title" },
    });

    expect(await po.getTitle()).toEqual("Universe title");
  });

  it("should render slot content", async () => {
    const po = renderComponent({
      universe: { ...mockUniverse, title: "Universe title" },
      testSlotContent: "Test slot content",
    });

    expect(await po.getText("slot")).toEqual("Test slot content");
  });
});
