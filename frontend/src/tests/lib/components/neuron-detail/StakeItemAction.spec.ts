/**
 * @jest-environment jsdom
 */

import StakeItemAction from "$lib/components/neuron-detail/StakeItemAction.svelte";
import { mockToken, mockUniverse } from "$tests/mocks/sns-projects.mock";
import { StakeItemActionPo } from "$tests/page-objects/StakeItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("StakeItemAction", () => {
  const renderComponent = ({
    increaseStakeCallback = () => undefined,
    ...props
  }) => {
    const { container, component } = render(StakeItemAction, {
      universe: mockUniverse,
      token: mockToken,
      neuronStake: 123456789n,
      ...props,
    });

    component.$on("increaseStake", increaseStakeCallback);

    return StakeItemActionPo.under(new JestPageObjectElement(container));
  };

  it("should render stake of the neuron", async () => {
    const neuronStake = 314000000n;
    const po = renderComponent({ neuronStake });

    expect(await po.getStake()).toBe("3.14");
  });

  it("should render token symbol", async () => {
    const po = renderComponent({
      token: {
        ...mockToken,
        symbol: "FLURB",
      },
    });

    expect(await po.getTokenSymbol()).toBe("FLURB");
  });

  it("should render increase stake button secondary variant", async () => {
    const po = renderComponent({});

    expect(await po.hasIncreaseStakeButton()).toBe(true);
    expect(await po.getIncreaseStakeButtonPo().getVariant()).toBe("secondary");
  });

  it("should not render increase stake button", async () => {
    const po = renderComponent({
      isIncreaseStakeAllowed: false,
    });

    expect(await po.hasIncreaseStakeButton()).toBe(false);
  });

  it("Dispatches event when clicked", async () => {
    const increaseStake = jest.fn();

    const po = await renderComponent({
      increaseStakeCallback: increaseStake,
    });

    expect(increaseStake).not.toBeCalled();

    await po.getIncreaseStakeButtonPo().click();

    expect(increaseStake).toBeCalledTimes(1);
  });
});
