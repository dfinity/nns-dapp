import BannerTest from "$tests/lib/components/ui/BannerTest.svelte";
import { BannerPo } from "$tests/page-objects/Banner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { nonNullish } from "@dfinity/utils";

describe("Banner", () => {
  const renderComponent = ({
    props = {},
    onClose,
  }: { props?: unknown; onClose?: () => void } = {}) => {
    const { container } = render(BannerTest, {
      props,
      events: {
        ...(nonNullish(onClose) && { nnsClose: onClose }),
      },
    });

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

  it("should display icon slot content", async () => {
    const po = renderComponent();

    expect(await po.getBannerIcon().isPresent()).toBe(true);
  });

  it("should display actions slot content", async () => {
    const testAction = "test-action";
    const po = renderComponent({
      props: {
        testAction,
      },
    });

    expect(await po.getActions().getText()).toContain(testAction);
  });

  it("should not have close button by default", async () => {
    const po = renderComponent();

    expect(await po.getCloseButton().isPresent()).toBe(false);
  });

  it("should have close button", async () => {
    const onClose = vi.fn();
    const po = renderComponent({
      props: {
        isClosable: true,
      },
      onClose,
    });

    expect(await po.getCloseButton().isPresent()).toBe(true);
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
