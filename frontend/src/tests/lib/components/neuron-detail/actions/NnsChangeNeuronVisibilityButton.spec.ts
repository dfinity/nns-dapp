import NnsChangeNeuronVisibilityButton from "$lib/components/neuron-detail/actions/NnsChangeNeuronVisibilityButton.svelte";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronVisibility } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

describe("NnsChangeNeuronVisibilityButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should display 'Make Neuron Private' for public neurons", () => {
    const { getByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: { ...mockNeuron, visibility: NeuronVisibility.Public },
        testComponent: NnsChangeNeuronVisibilityButton,
      },
    });

    expect(getByText(en.neuron_detail.make_neuron_private)).toBeInTheDocument();
  });

  it("should display 'Make Neuron Public' for private neurons", () => {
    const { getByText } = render(NeuronContextActionsTest, {
      props: {
        neuron: { ...mockNeuron, visibility: NeuronVisibility.Private },
        testComponent: NnsChangeNeuronVisibilityButton,
      },
    });

    expect(getByText(en.neuron_detail.make_neuron_public)).toBeInTheDocument();
  });

  it("opens change neuron visibility modal", async () => {
    const { container, queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: {
          ...mockNeuron,
        },
        testComponent: NnsChangeNeuronVisibilityButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("change-neuron-visibility-modal");
    expect(modal).toBeInTheDocument();
  });
});
