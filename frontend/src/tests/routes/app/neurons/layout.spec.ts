import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { referrerPathStore } from "$lib/stores/routes.store";
import { page } from "$mocks/$app/stores";
import NeuronsLayout from "$routes/(app)/(u)/(list)/neurons/+layout.svelte";
import { createMockSnippet } from "$tests/mocks/snippet.mock";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Neurons layout", () => {
  const renderComponent = () => {
    return render(NeuronsLayout, {
      props: {
        children: createMockSnippet(),
      },
    });
  };

  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to 'Neuron Staking'", () => {
    renderComponent();

    expect(get(layoutTitleStore)).toEqual({
      title: "Neuron Staking",
      header: "Neuron Staking",
    });
  });

  it("should have a back button", () => {
    const { getByTestId } = renderComponent();
    const backButton = getByTestId("back");

    expect(backButton).toBeInTheDocument();
  });

  it("should navigate back to Staking page", () => {
    page.mock({
      routeId: AppPath.Neurons,
    });

    const { getByTestId } = renderComponent();
    const backButton = getByTestId("back");

    expect(get(pageStore).path).toEqual(AppPath.Neurons);
    backButton.click();

    expect(get(pageStore).path).toBe(AppPath.Staking);
  });

  it("should navigate back to Portfolio page if previous page was Portfolio page", async () => {
    page.mock({
      routeId: AppPath.Neurons,
    });
    referrerPathStore.pushPath(AppPath.Portfolio);

    const { getByTestId } = renderComponent();
    const backButton = getByTestId("back");

    expect(get(pageStore).path).toEqual(AppPath.Neurons);
    backButton.click();

    expect(get(pageStore).path).toBe(AppPath.Portfolio);
  });
});
