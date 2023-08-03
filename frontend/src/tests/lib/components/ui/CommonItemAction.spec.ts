/**
 * @jest-environment jsdom
 */

import { CommonItemActionPo } from "$tests/page-objects/CommonItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import CommonItemActionTest from "./CommonItemActionTest.svelte";

describe("CommonItemAction", () => {
  const testId = "common-item-action-component";
  const renderComonent = ({ title, subtitle }) => {
    const { container } = render(CommonItemActionTest, {
      props: { title, subtitle, testId },
    });
    return CommonItemActionPo.under({
      element: new JestPageObjectElement(container),
      testId,
    });
  };

  it("should render title and subtitle", async () => {
    const title = "title";
    const subtitle = "subtitle";
    const po = renderComonent({ title, subtitle });
    expect(await po.getTitle()).toBe(title);
    expect(await po.getSubtitle()).toBe(subtitle);
  });
});
