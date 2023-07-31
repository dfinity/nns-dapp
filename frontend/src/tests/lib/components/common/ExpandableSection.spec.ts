/**
 * @jest-environment jsdom
 */

import { ExpandableSectionPo } from "$tests/page-objects/ExpandableSection.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import ExpandableSectionTest from "./ExpandableSectionTest.svelte";

describe("ExpandableSection", () => {
  const testId = "expandable-section-component";
  const title = "title";
  const initialDescription = "initial description";
  const expandedDescription = "expanded description";
  const renderComponent = () => {
    const { container } = render(ExpandableSectionTest, {
      props: {
        testId,
        title,
        initialDescription,
        expandedDescription,
      },
    });

    return ExpandableSectionPo.under({
      element: new JestPageObjectElement(container),
      testId,
    });
  };

  it("should render initial description", async () => {
    const po = renderComponent();
    expect(await po.getVisibleDescription()).toBe("initial description");
  });

  it("should render all description when clicking title", async () => {
    const po = renderComponent();

    expect(await po.getVisibleDescription()).toBe("initial description");

    await po.clickTitle();
    expect(await po.getVisibleDescription()).toBe(
      "initial descriptionexpanded description"
    );
  });
});
