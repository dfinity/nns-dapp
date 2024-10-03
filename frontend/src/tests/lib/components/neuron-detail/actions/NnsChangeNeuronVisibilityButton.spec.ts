import NnsChangeNeuronVisibilityButton from "$lib/components/neuron-detail/actions/NnsChangeNeuronVisibilityButton.svelte";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { NeuronVisibility } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import NeuronContextActionsTest from "../NeuronContextActionsTest.svelte";

describe("NnsChangeNeuronVisibilityButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (visibility: NeuronVisibility = undefined) => {
    const { container, queryByTestId } = render(NeuronContextActionsTest, {
      props: {
        neuron: { ...mockNeuron, visibility },
        testComponent: NnsChangeNeuronVisibilityButton,
      },
    });
    return {
      po: ButtonPo.under({
        element: new JestPageObjectElement(container),
        testId: "change-neuron-visibility-button",
      }),
      queryByTestId,
    };
  };

  it("should display 'Make Neuron Private' for public neurons", async () => {
    const { po } = renderComponent(NeuronVisibility.Public);

    expect(await po.getText()).toBe("Make Neuron Private");
  });

  it("should display 'Make Neuron Public' for private neurons", async () => {
    const { po } = renderComponent(NeuronVisibility.Private);

    expect(await po.getText()).toBe("Make Neuron Public");
  });

  it("opens change neuron visibility modal", async () => {
    const { po, queryByTestId } = renderComponent();

    expect(await po.isPresent()).toBe(true);

    await po.click();

    const modal = queryByTestId("change-neuron-visibility-modal");
    expect(modal).toBeInTheDocument();
  });
});
