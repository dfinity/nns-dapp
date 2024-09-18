import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import NeuronsLayout from "$routes/(app)/(u)/(list)/neurons/+layout.svelte";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Neurons layout", () => {
  beforeEach(() => {
    layoutTitleStore.set({ title: "" });
  });

  it("should set title and header layout to 'Neuron Staking'", () => {
    render(NeuronsLayout);

    expect(get(layoutTitleStore)).toEqual({
      title: "Neuron Staking",
      header: "Neuron Staking",
    });
  });

  it("should have a back button", () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_PROJECTS_TABLE", true);
    const { getByTestId } = render(NeuronsLayout);
    const backButton = getByTestId("back");
    expect(backButton).toBeInTheDocument();
    expect(get(pageStore).path).not.toBe(AppPath.Staking);
    backButton.click();
    expect(get(pageStore).path).toBe(AppPath.Staking);
  });
});
