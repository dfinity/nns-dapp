import SnsStakeMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsStakeMaturityButton.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("SnsStakeMaturityButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should open stake maturity modal", async () => {
    const { getByText, getByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsStakeMaturityButton,
      },
    });

    fireEvent.click(getByTestId("stake-maturity-button") as HTMLButtonElement);

    await waitFor(() =>
      expect(
        getByText(en.neuron_detail.stake_maturity_modal_title)
      ).toBeInTheDocument()
    );
  });

  it("should be disabled if no maturity to stake", async () => {
    const { getByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          maturity_e8s_equivalent: BigInt(0),
          staked_maturity_e8s_equivalent: [],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsStakeMaturityButton,
      },
    });

    const btn = getByTestId("stake-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
