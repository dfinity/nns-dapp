/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";
import HardwareWalletNeurons from '../../../../lib/components/accounts/HardwareWalletNeurons.svelte';
import type {Neuron} from '@dfinity/nns/dist/types/types/governance_converters';
import {formatICP} from '../../../../lib/utils/icp.utils';

describe("HardwareWalletNeurons", () => {
  const neuron2 = {
    ...mockNeuron,
    neuronId: "123",
    fullNeuron: {
      ...mockFullNeuron,
      cachedNeuronStake: BigInt(2_000_000_000),
    },
  };

  const mockNeurons = [mockNeuron, neuron2];

  it("should render text", () => {
    const { getByText } = render(HardwareWalletNeurons, {
      props: { neurons: mockNeurons },
    });

    expect(
      getByText(en.accounts.attach_hardware_neurons_text)
    ).toBeInTheDocument();
  });

  it("should render columns labels", () => {
    const { getByText } = render(HardwareWalletNeurons, {
      props: { neurons: mockNeurons },
    });

    expect(getByText(en.neurons.neuron_id)).toBeInTheDocument();
    expect(getByText(en.neurons.stake_amount)).toBeInTheDocument();
  });

  it("should render neurons", () => {
    const { getByText } = render(HardwareWalletNeurons, {
      props: { neurons: mockNeurons },
    });

    expect(getByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
    expect(getByText(neuron2.neuronId.toString())).toBeInTheDocument();

    expect(getByText(formatICP((mockNeuron.fullNeuron as Neuron).cachedNeuronStake))).toBeInTheDocument();
    expect(getByText(formatICP((neuron2.fullNeuron as Neuron).cachedNeuronStake))).toBeInTheDocument();
  });
});
