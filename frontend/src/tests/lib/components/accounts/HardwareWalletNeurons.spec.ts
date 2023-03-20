/**
 * @jest-environment jsdom
 */

import HardwareWalletNeurons from "$lib/components/accounts/HardwareWalletNeurons.svelte";
import { formatToken } from "$lib/utils/token.utils";
import { mockNeuronStake } from "$tests/mocks/hardware-wallet-neurons.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { Neuron } from "@dfinity/nns/dist/types/types/governance_converters";
import { render } from "@testing-library/svelte";
import HardwareWalletNeuronsTest from "./HardwareWalletNeuronsTest.svelte";

describe("HardwareWalletNeurons", () => {
  const props = { testComponent: HardwareWalletNeurons };

  it("should render text", () => {
    const { getByText } = render(HardwareWalletNeuronsTest, {
      props,
    });

    expect(
      getByText(en.accounts.attach_hardware_neurons_text)
    ).toBeInTheDocument();
  });

  it("should render columns labels", () => {
    const { getByText } = render(HardwareWalletNeuronsTest, {
      props,
    });

    expect(getByText(en.neurons.neuron_id)).toBeInTheDocument();
    expect(getByText(en.neurons.stake_amount)).toBeInTheDocument();
  });

  it("should render neurons", () => {
    const { getByText } = render(HardwareWalletNeuronsTest, {
      props,
    });

    expect(getByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
    expect(getByText(mockNeuronStake.neuronId.toString())).toBeInTheDocument();

    expect(
      getByText(
        formatToken({
          value: (mockNeuron.fullNeuron as Neuron).cachedNeuronStake,
        })
      )
    ).toBeInTheDocument();
    expect(
      getByText(
        formatToken({
          value: (mockNeuronStake.fullNeuron as Neuron).cachedNeuronStake,
        })
      )
    ).toBeInTheDocument();
  });

  it("should render a neuron that has a hotkey", () => {
    const { getAllByText } = render(HardwareWalletNeuronsTest, {
      props,
    });

    expect(
      getAllByText(en.accounts.attach_hardware_neurons_added)
    ).toHaveLength(1);
  });

  it("should render a neuron that has no hotkey", () => {
    const { getAllByText } = render(HardwareWalletNeuronsTest, {
      props,
    });

    expect(getAllByText(en.accounts.attach_hardware_neurons_add)).toHaveLength(
      1
    );
  });
});
