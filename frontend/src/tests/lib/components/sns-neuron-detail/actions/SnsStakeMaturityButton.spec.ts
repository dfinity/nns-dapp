import SnsStakeMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsStakeMaturityButton.svelte";
import SnsNeuronContextTest from "$tests/lib/components/sns-neuron-detail/SnsNeuronContextTest.svelte";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  createMockSnsNeuron,
  mockSnsNeuron,
} from "$tests/mocks/sns-neurons.mock";
import { NeuronState } from "@icp-sdk/canisters/nns";
import { fireEvent, render } from "@testing-library/svelte";

describe("SnsStakeMaturityButton", () => {
  it("should open stake maturity modal", async () => {
    const lockedNeuron = createMockSnsNeuron({
      state: NeuronState.Locked,
    });
    const { queryByTestId, getByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: lockedNeuron,
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

  it("should be disabled if neuron is dissolved", async () => {
    const dissolvedNeuron = createMockSnsNeuron({
      state: NeuronState.Dissolved,
    });
    const { getByTestId } = render(SnsStakeMaturityButton, {
      props: {
        neuron: dissolvedNeuron,
      },
    });

    const btn = getByTestId("stake-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
