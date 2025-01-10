import SnsStakeMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsStakeMaturityButton.svelte";
import SnsNeuronContextTest from "$tests/lib/components/sns-neuron-detail/SnsNeuronContextTest.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { fireEvent, render } from "@testing-library/svelte";

describe("SnsStakeMaturityButton", () => {
  it("should open stake maturity modal", async () => {
    const { queryByTestId, getByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          maturity_e8s_equivalent: 100_000_000n,
        },
        testComponent: SnsStakeMaturityButton,
        passPropNeuron: true,
        rootCanisterId: mockPrincipal,
      },
    });

    expect(
      queryByTestId("stake-maturity-modal-component")
    ).not.toBeInTheDocument();

    await fireEvent.click(
      getByTestId("stake-maturity-button") as HTMLButtonElement
    );

    expect(queryByTestId("stake-maturity-modal-component")).toBeInTheDocument();
  });

  it("should be disabled if no maturity to stake", async () => {
    const { getByTestId } = render(SnsStakeMaturityButton, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          maturity_e8s_equivalent: 0n,
          staked_maturity_e8s_equivalent: [],
        },
      },
    });

    const btn = getByTestId("stake-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
