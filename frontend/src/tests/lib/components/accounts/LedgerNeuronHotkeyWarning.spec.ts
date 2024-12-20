import { LedgerNeuronHotkeyWarningPo } from "$tests/page-objects/LedgerNeuronHotkeyWarning.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import LedgerNeuronHotkeyWarning from "$lib/components/accounts/LedgerNeuronHotkeyWarning.svelte";

describe("LedgerNeuronHotkeyWarning", () => {
  const localStorageKey = "isLedgerNeuronHotkeyWarningDisabled";
  const renderComponent = () => {
    const { container } = render(LedgerNeuronHotkeyWarning);
    return LedgerNeuronHotkeyWarningPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("should be shown when localStorageKey not set", async () => {
    const po = await renderComponent();
    expect(localStorage.getItem(localStorageKey)).toBeNull();
    
    expect(await po.isBannerVisible()).toBe(true);
  });

  it("should not render when localStorageKey is set to true", async () => {
    localStorage.setItem(localStorageKey, "true");
    const po = await renderComponent();

    expect(await po.isBannerVisible()).toBe(false);
  });


  it("should be closable", async () => {
    const po = await renderComponent();

    expect(await po.isBannerVisible()).toBe(true);
    expect(localStorage.getItem(localStorageKey)).toBeNull();

    await po.getBannerPo().clickClose();

    expect(await po.isBannerVisible()).toBe(false);
    expect(localStorage.getItem(localStorageKey)).toEqual("true");
  });

});
