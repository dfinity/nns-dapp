import HideZeroBalancesToggle from "$lib/components/tokens/TokensTable/HideZeroBalancesToggle.svelte";
import { hideZeroBalancesStore } from "$lib/stores/hide-zero-balances.store";
import { HideZeroBalancesTogglePo } from "$tests/page-objects/HideZeroBalancesToggle.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("HideZeroBalancesToggle", () => {
  beforeEach(() => {
    hideZeroBalancesStore.resetForTesting();
  });

  const renderComponent = () => {
    const { container } = render(HideZeroBalancesToggle);
    return HideZeroBalancesTogglePo.under(new JestPageObjectElement(container));
  };

  it("should update the store when toggled", async () => {
    const po = renderComponent();
    const toggle = po.getTogglePo();

    expect(get(hideZeroBalancesStore)).toBe("show");
    expect(await toggle.isEnabled()).toBe(false);

    await toggle.toggle();

    expect(get(hideZeroBalancesStore)).toBe("hide");
    expect(await toggle.isEnabled()).toBe(true);

    await toggle.toggle();

    expect(get(hideZeroBalancesStore)).toBe("show");
    expect(await toggle.isEnabled()).toBe(false);
  });

  it("should update toggle when store is set", async () => {
    const po = renderComponent();
    const toggle = po.getTogglePo();

    expect(get(hideZeroBalancesStore)).toBe("show");
    expect(await toggle.isEnabled()).toBe(false);

    hideZeroBalancesStore.set("hide");

    expect(get(hideZeroBalancesStore)).toBe("hide");
    expect(await toggle.isEnabled()).toBe(true);

    hideZeroBalancesStore.set("show");

    expect(get(hideZeroBalancesStore)).toBe("show");
    expect(await toggle.isEnabled()).toBe(false);
  });
});
