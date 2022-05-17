/**
 * @jest-environment jsdom
 */

import type { Neuron } from "@dfinity/nns/dist/types/types/governance_converters";
import { render } from "@testing-library/svelte";
import HardwareWalletNeurons from "../../../../lib/components/accounts/HardwareWalletNeurons.svelte";
import { formatICP } from "../../../../lib/utils/icp.utils";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import HardwareWalletNeuronsTest from './HardwareWalletNeuronsTest.svelte';
import {mockNeuronStake} from '../../../mocks/hardware-wallet-neurons.store.mock';

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
      getByText(formatICP((mockNeuron.fullNeuron as Neuron).cachedNeuronStake))
    ).toBeInTheDocument();
    expect(
      getByText(formatICP((mockNeuronStake.fullNeuron as Neuron).cachedNeuronStake))
    ).toBeInTheDocument();
  });
});
