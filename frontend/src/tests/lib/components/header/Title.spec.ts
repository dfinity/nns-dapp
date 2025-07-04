import Title from "$lib/components/header/Title.svelte";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { render, within } from "@testing-library/svelte";

describe("Title", () => {
  beforeEach(() => layoutTitleStore.set({ title: "" }));

  it("should render a title in the DOM header", () => {
    const testTitle = "test test test";

    layoutTitleStore.set({ title: testTitle });

    render(Title);

    const title = within(document.head).getByText(
      `${testTitle} | Network Nervous System`
    );

    expect(title).not.toBeNull();
  });

  it("should render a header", () => {
    const testTitle = "test test test";
    const testHeader = "header my header";

    layoutTitleStore.set({ title: testTitle, header: testHeader });

    const { getByText } = render(Title);
    expect(getByText(testHeader)).toBeInTheDocument();
  });

  it("should fallback to title for header", () => {
    const testTitle = "test test test";

    layoutTitleStore.set({ title: testTitle });

    const { container } = render(Title);
    expect(container.querySelector("h1")?.textContent).toEqual(testTitle);
  });

  it("should never render an empty header", () => {
    const testTitle = "test test test";
    const testHeader = "";

    layoutTitleStore.set({ title: testTitle, header: testHeader });

    const { container } = render(Title);
    expect(container.querySelector("h1")?.textContent.trim()).toEqual(
      testTitle.trim()
    );
  });
});
