import SnsStakeItemAction from "$lib/components/sns-neuron-detail/SnsStakeItemAction.svelte";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { mockToken, mockUniverse } from "$tests/mocks/sns-projects.mock";
import { SnsStakeItemActionPo } from "$tests/page-objects/SnsStakeItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsStakeItemAction", () => {
  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsStakeItemAction, {
      props: {
        neuron,
        universe: mockUniverse,
        token: mockToken,
      },
    });

    return SnsStakeItemActionPo.under(new JestPageObjectElement(container));
  };

  it("should render Stake of the neuron", async () => {
    const stake = 314000000n;
    const neuron = createMockSnsNeuron({
      id: [1],
      stake,
    });
    const po = renderComponent(neuron);

    expect(await po.getStake()).toBe("3.14");
  });

  it("should render increase stake button", async () => {
    const po = renderComponent(mockSnsNeuron);

    expect(await po.hasIncreaseStakeButton()).toBe(true);
  });
});
