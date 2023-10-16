import NnsNeuronInfo from "$lib/components/neurons/NnsNeuronInfo.svelte";
import { neuronStake } from "$lib/utils/neuron.utils";
import { formatToken } from "$lib/utils/token.utils";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { render } from "@testing-library/svelte";

describe("NnsNeuronInfo", () => {
  it("should render neuron id", () => {
    const { getByText } = render(NnsNeuronInfo, {
      props: {
        neuron: mockNeuron,
      },
    });

    expect(getByText(String(mockNeuron.neuronId))).toBeInTheDocument();
  });

  it("should render neuron stake", () => {
    const { getByText } = render(NnsNeuronInfo, {
      props: {
        neuron: mockNeuron,
      },
    });

    expect(
      getByText(formatToken({ value: neuronStake(mockNeuron), detailed: true }))
    ).toBeInTheDocument();
  });
});
