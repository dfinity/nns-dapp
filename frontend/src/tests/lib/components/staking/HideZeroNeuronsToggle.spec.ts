import HideZeroNeuronsToggle from "$lib/components/staking/HideZeroNeuronsToggle.svelte";
import { hideZeroNeuronsStore } from "$lib/stores/hide-zero-neurons.store";
import { HideZeroNeuronsTogglePo } from "$tests/page-objects/HideZeroNeuronsToggle.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";

describe("HideZeroNeuronsToggle", () => {
  const renderComponent = () => {
    const { container } = render(HideZeroNeuronsToggle);
    return HideZeroNeuronsTogglePo.under(new JestPageObjectElement(container));
  };

  it("should update the store when toggled", async () => {
    const po = renderComponent();
    const toggle = po.getTogglePo();

    expect(get(hideZeroNeuronsStore)).toBe("show");
    expect(await toggle.isEnabled()).toBe(false);

    await toggle.toggle();

    expect(get(hideZeroNeuronsStore)).toBe("hide");
    expect(await toggle.isEnabled()).toBe(true);

    await toggle.toggle();

    expect(get(hideZeroNeuronsStore)).toBe("show");
    expect(await toggle.isEnabled()).toBe(false);
  });

  it("should update toggle when store is set", async () => {
    const po = renderComponent();
    const toggle = po.getTogglePo();

    expect(get(hideZeroNeuronsStore)).toBe("show");
    expect(await toggle.isEnabled()).toBe(false);

    hideZeroNeuronsStore.set("hide");
    await tick();

    expect(get(hideZeroNeuronsStore)).toBe("hide");
    expect(await toggle.isEnabled()).toBe(true);

    hideZeroNeuronsStore.set("show");
    await runResolvedPromises();

    expect(get(hideZeroNeuronsStore)).toBe("show");
    expect(await toggle.isEnabled()).toBe(false);
  });
});
