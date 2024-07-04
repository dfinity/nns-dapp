import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import NeuronsLayout from "$routes/(app)/(u)/(list)/neurons/+layout.svelte";
import { SelectUniverseDropdownPo } from "$tests/page-objects/SelectUniverseDropdown.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Neurons layout", () => {
  const hasUniverseNav = (container: HTMLElement): Promise<boolean> =>
    SelectUniverseDropdownPo.under(
      new JestPageObjectElement(container)
    ).isPresent();

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

  describe("when ENABLE_PROJECTS_TABLE is disabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_PROJECTS_TABLE", false);
    });

    it("should not have a back button", () => {
      const { getByTestId } = render(NeuronsLayout);
      expect(() => getByTestId("back")).toThrow();
    });

    it("should have universe navigation", async () => {
      const { container } = render(NeuronsLayout);
      expect(await hasUniverseNav(container)).toBe(true);
    });
  });

  describe("when ENABLE_PROJECTS_TABLE is enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_PROJECTS_TABLE", true);
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

    it("should not have universe navigation", async () => {
      const { container } = render(NeuronsLayout);
      expect(await hasUniverseNav(container)).toBe(false);
    });
  });
});
