import { BannerPo } from "$tests/page-objects/Banner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import BannerTest from "./BannerTest.svelte";

describe("Banner", () => {
  const renderComponent = ({
    props = {},
    onClose,
  }: { props?: unknown; onClose?: () => void } = {}) => {
    const { container, component } = render(BannerTest, {
      props,
    });

    if (onClose) {
      component.$on("nnsClose", onClose);
    }

    return BannerPo.under(new JestPageObjectElement(container));
  };

  it("should render text and title", async () => {
    const po = renderComponent({
      props: {
        title: "Test Title",
        text: "Test Text",
      },
    });

    expect(await po.getTitle()).toEqual("Test Title");
    expect(await po.getText()).toEqual("Test Text");
  });

  it("should render HTML content", async () => {
    const po = renderComponent({
      props: {
        htmlText: "<p>Test HTML Text</p>",
      },
    });

    expect(await po.getHtmlText()).toContain("Test HTML Text");
  });

  it("should display slots", async () => {
    const po = renderComponent();

    expect(await po.getText()).toContain("test-icon");
    expect(await po.getText()).toContain("test-action");
  });

  it("should not have close button by default", async () => {
    const po = renderComponent();

    expect(await po.isClosable()).toBe(false);
  });

  it("should have close button", async () => {
    const onClose = vi.fn();
    const po = renderComponent({
      props: {
        isClosable: true,
      },
      onClose,
    });

    expect(await po.isClosable()).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(0);
    await po.clickClose();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not be critical by default", async () => {
    const po = renderComponent();

    expect(await po.isCritical()).toBe(false);
  });

  it("should be critical", async () => {
    const po = renderComponent({
      props: {
        isCritical: true,
      },
    });

    expect(await po.isCritical()).toBe(true);
  });
});
