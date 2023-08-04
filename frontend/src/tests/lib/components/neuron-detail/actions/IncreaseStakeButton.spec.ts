
/**
 * @jest-environment jsdom
 */

import IncreaseStakeButtonTest from "./IncreaseStakeButtonTest.svelte";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { IncreaseStakeButtonPo } from "$tests/page-objects/IncreaseStakeButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("IncreaseStakeButton", () => {
  const renderComponent = async (props) => {
    const { container } = render(IncreaseStakeButtonTest, props);
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
