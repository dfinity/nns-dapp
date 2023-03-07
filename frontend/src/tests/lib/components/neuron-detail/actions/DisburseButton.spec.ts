/**
 * @jest-environment jsdom
 */

import DisburseButton from "$lib/components/neuron-detail/actions/DisburseButton.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { mockAccountsStoreData } from "$tests/mocks/accounts.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent, render } from "@testing-library/svelte";
import NeuronContextTest from "../NeuronContextTest.svelte";

describe("DisburseButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", () => {
    const { getByText } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: DisburseButton,
      },
    });

    expect(getByText(en.neuron_detail.disburse)).toBeInTheDocument();
  });

  it("opens disburse nns neuron modal", async () => {
    // To avoid that the modal requests the accounts
    accountsStore.set(mockAccountsStoreData);
    const { container, queryByTestId } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: DisburseButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = queryByTestId("disburse-neuron-modal");
    expect(modal).toBeInTheDocument();
  });
});
