/**
 * @jest-environment jsdom
 */

import NnsIncreaseStakeButton from "$lib/components/neuron-detail/actions/NnsIncreaseStakeButton.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { mockAccountsStoreData } from "../../../../mocks/accounts.store.mock";
import en from "../../../../mocks/i18n.mock";
import { mockNeuron } from "../../../../mocks/neurons.mock";
import NeuronContextTest from "../NeuronContextTest.svelte";

describe("NnsIncreaseStakeButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders increase stake message", () => {
    const { getByText } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: NnsIncreaseStakeButton,
      },
    });

    expect(getByText(en.neuron_detail.increase_stake)).toBeInTheDocument();
  });

  it("opens Increase Neuron Stake Modal", async () => {
    // To avoid that the modal requests the accounts
    accountsStore.set(mockAccountsStoreData);
    const { container } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: NnsIncreaseStakeButton,
      },
    });

    const buttonElement = container.querySelector("button");
    expect(buttonElement).not.toBeNull();

    buttonElement && (await fireEvent.click(buttonElement));

    const modal = container.querySelector("div.modal");
    expect(modal).toBeInTheDocument();
  });
});
