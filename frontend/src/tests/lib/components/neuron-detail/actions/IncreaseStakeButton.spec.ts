import IncreaseStakeButton from "$lib/components/neuron-detail/actions/IncreaseStakeButton.svelte";
import { IncreaseStakeButtonPo } from "$tests/page-objects/IncreaseStakeButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("IncreaseStakeButton", () => {
  const renderComponent = async ({
    increaseStakeCallback = () => undefined,
  }) => {
    const { container } = render(IncreaseStakeButton, {
      props: {},
      events: {
        increaseStake: increaseStakeCallback,
      },
    });

    return IncreaseStakeButtonPo.under(new JestPageObjectElement(container));
  };

  it("Dispatches event when clicked", async () => {
    const increaseStake = vi.fn();

    const po = await renderComponent({
      increaseStakeCallback: increaseStake,
    });

    expect(increaseStake).not.toBeCalled();

    await po.click();

    expect(increaseStake).toBeCalledTimes(1);
  });
});
