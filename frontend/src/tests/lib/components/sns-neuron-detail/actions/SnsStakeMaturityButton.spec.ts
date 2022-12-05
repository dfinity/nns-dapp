/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import en from "../../../../mocks/i18n.mock";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";
import {mockSnsNeuron} from "../../../../mocks/sns-neurons.mock";
import {mockPrincipal} from "../../../../mocks/auth.store.mock";
import SnsStakeMaturityButton from "$lib/components/sns-neuron-detail/actions/SnsStakeMaturityButton.svelte";

describe("SnsStakeMaturityButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should open stake maturity modal", async () => {
    const { getByText, getByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: mockSnsNeuron,
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
        props: {
          neuron: {
            ...mockSnsNeuron,
            maturity_e8s_equivalent: BigInt(0),
            staked_maturity_e8s_equivalent: []
          },
          rootCanisterId: mockPrincipal,
          testComponent: SnsStakeMaturityButton,
        },
      },
    });

    const btn = getByTestId("stake-maturity-button") as HTMLButtonElement;

    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
