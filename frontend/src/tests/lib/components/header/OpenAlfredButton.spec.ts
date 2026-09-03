import OpenAlfredButton from "$lib/components/header/OpenAlfredButton.svelte";
import { alfredVisibleStore } from "$lib/stores/alfred.store";
import en from "$tests/mocks/i18n.mock";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("OpenAlfredButton", () => {
  const renderComponent = () => {
    const { container } = render(OpenAlfredButton);

    return ButtonPo.under({
      element: new JestPageObjectElement(container),
      testId: "open-alfred",
    });
  };

  it("should render a labelled button", async () => {
    const po = renderComponent();

    expect(await po.isPresent()).toBe(true);
    expect(await po.getAriaLabel()).toBe(en.navigation.search);
  });

  it("should open the palette", async () => {
    const po = renderComponent();
    expect(get(alfredVisibleStore)).toBe(false);

    await po.click();

    expect(get(alfredVisibleStore)).toBe(true);
  });

  it("should keep the palette open when it is already open", async () => {
    const po = renderComponent();
    alfredVisibleStore.set(true);

    await po.click();

    expect(get(alfredVisibleStore)).toBe(true);
  });
});
