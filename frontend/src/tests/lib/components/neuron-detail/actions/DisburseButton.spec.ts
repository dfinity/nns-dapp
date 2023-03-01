/**
 * @jest-environment jsdom
 */

import DisburseButton from "$lib/components/neuron-detail/actions/DisburseButton.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { fireEvent, render } from "@testing-library/svelte";
import { mockAccountsStoreData } from "../../../../mocks/accounts.store.mock";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";
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
