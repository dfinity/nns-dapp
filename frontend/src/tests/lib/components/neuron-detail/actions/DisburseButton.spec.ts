import DisburseButton from "$lib/components/neuron-detail/actions/DisburseButton.svelte";
import NeuronContextTest from "$tests/lib/components/neuron-detail/NeuronContextTest.svelte";
import en from "$tests/mocks/i18n.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { fireEvent, render } from "@testing-library/svelte";

describe("DisburseButton", () => {
  const renderComponent = () => {
    return render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        TestComponent: DisburseButton,
      },
    });
  };

  it("renders title", () => {
    const { getByText } = renderComponent();
    expect(getByText(en.neuron_detail.disburse)).toBeInTheDocument();
  });

  it("opens disburse nns neuron modal", async () => {
    // To avoid that the modal requests the accounts
    setAccountsForTesting(mockAccountsStoreData);
    const { container, queryByTestId } = renderComponent();

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("disburse-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
