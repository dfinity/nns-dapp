import CalloutWarning from "$lib/components/common/CalloutWarning.svelte";
import { CalloutWarningPo } from "$tests/page-objects/CalloutWarning.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("CalloutWarning", () => {
  const renderComponent = (props) => {
    const { container } = render(CalloutWarning, {
      props,
    });
    return CalloutWarningPo.under(new JestPageObjectElement(container));
  };

  it("should render description text", async () => {
    const po = renderComponent({
      htmlText: "test",
    });

    expect(await po.getDescription()).toEqual("test");
  });

  it("should render as html", async () => {
    const po = renderComponent({
      htmlText: "<strong>test</strong>",
    });

    expect(await po.getDescription()).toEqual("test");
  });
});
