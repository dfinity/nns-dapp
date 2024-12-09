import NeuronTag from "$lib/components/ui/NeuronTag.svelte";
import { NeuronTagPo } from "$tests/page-objects/NeuronTag.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("NeuronTag", () => {
  const renderComponent = (props) => {
    const { container } = render(NeuronTag, props);
    return NeuronTagPo.under(new JestPageObjectElement(container));
  };

  it("should render default tag", async () => {
    const po = renderComponent({
      props: { tag: { text: "test" } },
    });

    expect(await po.getText()).toEqual("test");
    expect(await po.isIntentError()).toEqual(false);
    expect(await po.isIntentWarning()).toEqual(false);
    expect(await po.isSizeLarge()).toEqual(false);
  });

  it("should render in danger status", async () => {
    const po = renderComponent({
      props: { tag: { text: "test", status: "danger" } },
    });

    expect(await po.isIntentWarning()).toEqual(false);
    expect(await po.isIntentError()).toEqual(true);
  });

  it("should render in warning status", async () => {
    const po = renderComponent({
      props: { tag: { text: "test", status: "warning" } },
    });

    expect(await po.isIntentError()).toEqual(false);
    expect(await po.isIntentWarning()).toEqual(true);
  });

  it("should render large tag", async () => {
    const po = renderComponent({
      props: { tag: { text: "test" }, size: "large" },
    });

    expect(await po.isSizeLarge()).toEqual(true);
  });
});
