import PrivacyAwareAmount from "$lib/components/ui/PrivacyAwareAmount.svelte";
import { balancePrivacyOptionStore } from "$lib/stores/balance-privacy-option.store";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("PrivacyAwareAmount", () => {
  const renderComponent = (props: { value: unknown; length: number }) => {
    const { container } = render(PrivacyAwareAmount, { props });
    return new JestPageObjectElement(container);
  };

  it("should display the provided value when user is not signed-in", async () => {
    setNoIdentity();
    balancePrivacyOptionStore.set("show");

    const value = "-/-";
    const po = renderComponent({ value, length: 3 });
    expect(await po.getText()).toBe(value);
  });

  it("should display the provided value when user is signed-in but hide was not toggled", async () => {
    resetIdentity();
    balancePrivacyOptionStore.set("show");

    const value = "123.21";
    const po = renderComponent({ value, length: 3 });
    expect(await po.getText()).toBe(value);
  });

  it("should show hide characters when user is signed-in and hide was toggled", async () => {
    resetIdentity();
    balancePrivacyOptionStore.set("hide");

    const value = "123.21";
    const po = renderComponent({ value, length: 3 });
    expect(await po.getText()).toBe("•••");
  });

  it("should show the specified number of hide characters when user is signed-in and hide was toggled", async () => {
    resetIdentity();
    balancePrivacyOptionStore.set("hide");

    const value = "123.21";
    const po = renderComponent({ value, length: 6 });
    expect(await po.getText()).toBe("••••••");
  });
});
