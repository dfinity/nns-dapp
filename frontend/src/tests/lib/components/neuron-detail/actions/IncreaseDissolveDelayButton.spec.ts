/**
 * @jest-environment jsdom
 */

import IncreaseDissolveDelayButton from "$lib/components/neuron-detail/actions/IncreaseDissolveDelayButton.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextTest from "../NeuronContextTest.svelte";

describe("IncreaseDissolveDelayButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextTest, {
      props: {
        neuron,
        testComponent: IncreaseDissolveDelayButton,
      },
    });

    return ButtonPo.under({
      element: new JestPageObjectElement(container),
    });
  };

  it("should render 'Increase Delay' text for non unlocked neurons", async () => {
    const lockedNeuron = {
      ...mockNeuron,
      state: NeuronState.Locked,
    };
    const po = renderComponent(lockedNeuron);
    expect(await po.getText()).toEqual("Increase Delay");
  });

  it("should render 'Set Dissolve Delay' text for unlocked neurons", async () => {
    const unlockedNeuron = {
      ...mockNeuron,
      state: NeuronState.Dissolved,
    };
    const po = renderComponent(unlockedNeuron);
    expect(await po.getText()).toEqual("Set Dissolve Delay");
  });

  it("opens Increase Dissolve Delay Modal", async () => {
    const { container, getByTestId } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: IncreaseDissolveDelayButton,
      },
    });

    const po = ButtonPo.under({
      element: new JestPageObjectElement(container),
    });

    await po.click();

    expect(
      getByTestId("increase-dissolve-delay-modal-component")
    ).toBeInTheDocument();
  });
});
