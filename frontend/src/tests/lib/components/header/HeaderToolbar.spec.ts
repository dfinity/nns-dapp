import HeaderToolbar from "$lib/components/header/HeaderToolbar.svelte";
import { alfredVisibleStore } from "$lib/stores/alfred.store";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { HeaderToolbarPo } from "$tests/page-objects/HeaderToolbar.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("HeaderToolbar", () => {
  const renderComponent = () => {
    const { container } = render(HeaderToolbar);

    return HeaderToolbarPo.under(new JestPageObjectElement(container));
  };

  it("should render the search button when the user is signed in", async () => {
    resetIdentity();
    const po = renderComponent();

    expect(await po.getOpenAlfredButtonPo().isPresent()).toBe(true);
  });

  it("should render the search button when the user is signed out", async () => {
    setNoIdentity();
    const po = renderComponent();

    expect(await po.getOpenAlfredButtonPo().isPresent()).toBe(true);
  });

  it("should open the palette from the search button", async () => {
    resetIdentity();
    const po = renderComponent();
    expect(get(alfredVisibleStore)).toBe(false);

    await po.clickOpenAlfred();

    expect(get(alfredVisibleStore)).toBe(true);
  });
});
