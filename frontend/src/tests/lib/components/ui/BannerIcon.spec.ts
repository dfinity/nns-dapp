import BannerIconTest from "$tests/lib/components/ui/BannerIconTest.svelte";
import { BannerIconPo } from "$tests/page-objects/BannerIcon.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("BannerIcon", () => {
  const renderComponent = (props?: unknown) => {
    const { container } = render(BannerIconTest, {
      props,
    });

    return BannerIconPo.under(new JestPageObjectElement(container));
  };

  it("should render slot", async () => {
    const slotContent = "Test slot content";
    const po = renderComponent({
      slotContent,
    });

    expect(await po.root.getText()).toEqual(slotContent);
  });

  it("should not have a specified status by default", async () => {
    const po = renderComponent();

    expect(await po.isStatusError()).toBe(false);
    expect(await po.isStatusSuccess()).toBe(false);
  });

  it("should display error status", async () => {
    const po = renderComponent({
      status: "error",
    });

    expect(await po.isStatusError()).toBe(true);
  });

  it("should display success status", async () => {
    const po = renderComponent({
      status: "success",
    });

    expect(await po.isStatusSuccess()).toBe(true);
  });
});
