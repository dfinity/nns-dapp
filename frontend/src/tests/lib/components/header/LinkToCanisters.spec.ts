import LinkToCanisters from "$lib/components/header/LinkToCanisters.svelte";
import {
  mockLinkClickEvent,
  resetNavigationCallbacks,
} from "$mocks/$app/navigation";
import { LinkToCanistersPo } from "$tests/page-objects/LinkToCanisters.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("LinkToCanisters", () => {
  beforeEach(() => {
    resetNavigationCallbacks();
  });

  const renderComponent = () => {
    const { container, component } = render(LinkToCanisters);
    const po = LinkToCanistersPo.under({
      element: new JestPageObjectElement(container),
    });

    container.addEventListener("click", mockLinkClickEvent);

    const onNnsClick = vi.fn();
    component.$on("nnsLink", onNnsClick);

    return { po, onNnsClick };
  };

  it("should render the canisters link", async () => {
    const { po } = renderComponent();

    expect(await po.isPresent()).toBe(true);
  });

  it("should have the correct href", async () => {
    const { po } = renderComponent();

    expect(await po.getHref()).toBe(
      "/canisters/?u=qhbym-qaaaa-aaaaa-aaafq-cai"
    );
  });

  it("should have the correct text", async () => {
    const { po } = renderComponent();

    expect(await po.getText()).toBe(" Canisters");
  });

  it("should have the icon in component", async () => {
    const { po } = renderComponent();

    expect(await po.hasIcon()).toBe(true);
  });

  it("should dispatch nnsLink event before navigation", async () => {
    const { po, onNnsClick } = renderComponent();

    expect(onNnsClick).toHaveBeenCalledTimes(0);

    await po.click();

    expect(onNnsClick).toHaveBeenCalledTimes(1);
  });
});
