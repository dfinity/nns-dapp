/**
 * @jest-environment jsdom
 */

import IncreaseStakeButton from "$lib/components/neuron-detail/actions/IncreaseStakeButton.svelte";
import { IncreaseStakeButtonPo } from "$tests/page-objects/IncreaseStakeButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("IncreaseStakeButton", () => {
  const renderComponent = async ({
    increaseStakeCallback = () => undefined,
    ...props
  }) => {
    const { container, component } = render(IncreaseStakeButton, props);

    component.$on("increaseStake", increaseStakeCallback);

    return IncreaseStakeButtonPo.under(new JestPageObjectElement(container));
  };

  it("Dispatches event when clicked", async () => {
    const increaseStake = jest.fn();

    const po = await renderComponent({
      increaseStakeCallback: increaseStake,
    });

    expect(increaseStake).not.toBeCalled();

    await po.click();

    expect(increaseStake).toBeCalledTimes(1);
  });

  it("renders variant primary by default", async () => {
    const po = await renderComponent({});
    expect(await po.getVariant()).toBe("primary");
  });

  it("renders variant secondary if set", async () => {
    const po = await renderComponent({
      variant: "secondary",
    });
    expect(await po.getVariant()).toBe("secondary");
  });
});
