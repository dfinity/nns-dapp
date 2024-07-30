import ImportTokenWarning from "$lib/components/accounts/ImportTokenWarning.svelte";
import { ImportTokenWarningPo } from "$tests/page-objects/ImportTokenWarning.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ImportTokenWarning", () => {
  const renderComponent = (props) => {
    const { container } = render(ImportTokenWarning, {
      props,
    });
    return ImportTokenWarningPo.under(new JestPageObjectElement(container));
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
