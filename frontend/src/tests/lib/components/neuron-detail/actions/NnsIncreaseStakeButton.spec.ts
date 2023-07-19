import NnsIncreaseStakeButton from "$lib/components/neuron-detail/actions/NnsIncreaseStakeButton.svelte";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import en from "$tests/mocks/i18n.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import NeuronContextTest from "../NeuronContextTest.svelte";

describe("NnsIncreaseStakeButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
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

  it("uses variant", () => {
    const variant = "secondary";
    const { queryByTestId } = render(NeuronContextTest, {
      props: {
        neuron: mockNeuron,
        testComponent: NnsIncreaseStakeButton,
        componentProps: {
          variant,
        },
      },
    });

    expect(
      queryByTestId("nns-increase-stake-button-component").classList.contains(
        variant
      )
    ).toBe(true);
  });

  it("opens Increase Neuron Stake Modal", async () => {
    // To avoid that the modal requests the accounts
    icpAccountsStore.setForTesting(mockAccountsStoreData);
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
