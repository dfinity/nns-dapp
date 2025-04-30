import Highlight from "$lib/components/ui/Highlight.svelte";
import { StoreLocalStorageKey } from "$lib/constants/stores.constants";
import { HighlightPo } from "$tests/page-objects/Highlight.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Highlight", () => {
  const defaultProps = {
    id: "test-highlight",
    level: "info" as const,
    title: "Test Title",
    description: "Test Description",
    link: "https://example.com",
  };

  const getStorageKey = (id: string) =>
    `${StoreLocalStorageKey.HighlightDisplay}${id}`;

  const renderComponent = (props = defaultProps) => {
    const { container } = render(Highlight, props);
    return HighlightPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("should render by default", async () => {
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
    expect(await po.getTitle()).toBe(defaultProps.title);
    expect(await po.getDescription()).toBe(defaultProps.description);
  });

  it("should hide the component when the close button is clicked", async () => {
    vi.useFakeTimers();

    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);

    await po.clickClose();

    vi.advanceTimersByTime(1000);

    expect(await po.isPresent()).toBe(false);

    expect(localStorage.getItem(getStorageKey(defaultProps.id))).toBe("false");
  });

  it("should not render if localStorage indicates it is closed", async () => {
    localStorage.setItem(getStorageKey(defaultProps.id), "false");

    const po = renderComponent();

    expect(await po.isPresent()).toBe(false);
  });

  it("should render when different id is used even if another highlight was closed", async () => {
    localStorage.setItem(getStorageKey("other-id"), "true");

    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should not render link when link prop is not provided", async () => {
    const po = renderComponent({
      ...defaultProps,
      link: undefined,
    });

    expect(await po.isPresent()).toBe(true);
    expect(await po.hasLink()).toBe(false);
  });
});
