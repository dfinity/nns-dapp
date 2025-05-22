import ToggleBalancePrivacyOption from "$lib/components/header/ToggleBalancePrivacyOption.svelte";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { ToggleBalancePrivacyOptionPageObject } from "$tests/page-objects/ToggleBalancePrivacyOption.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { get } from "svelte/store";

describe("ToggleBalancePrivacyOption", () => {
  const renderComponent = () => {
    const { container } = render(ToggleBalancePrivacyOption);
    const po = ToggleBalancePrivacyOptionPageObject.under({
      element: new JestPageObjectElement(container),
    });

    return po;
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should initialize the toggle to off if the store is hide", async () => {
    balancePrivacyOptionStore.set("hide");
    const po = renderComponent();

    expect(await po.isToggleEnabled()).toBe(true);
  });

  it("should initialize the toggle to on if the store is show", async () => {
    balancePrivacyOptionStore.set("show");
    const po = renderComponent();

    expect(await po.isToggleEnabled()).toBe(false);
  });

  it("should mutate the store when the toggle is clicked", async () => {
    balancePrivacyOptionStore.set("hide");
    const po = renderComponent();

    expect(await po.isToggleEnabled()).toBe(true);

    await po.click();

    expect(await po.isToggleEnabled()).toBe(false);
    expect(get(balancePrivacyOptionStore)).toBe("show");
  });
});
