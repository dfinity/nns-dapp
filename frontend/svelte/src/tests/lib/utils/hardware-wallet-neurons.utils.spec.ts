import { mapHardwareWalletNeuronInfo } from "../../../lib/utils/hardware-wallet-neurons.utils";
import { mockIdentity } from "../../mocks/auth.store.mock";
import {
  mockNeuronControlled,
  mockNeuronNotControlled,
} from "../../mocks/neurons.mock";

describe("hardware-wallet-neurons.utilse", () => {
  it("should map neuron to a controlled by nns dapp neuron", () =>
    expect(
      mapHardwareWalletNeuronInfo({
        neuron: mockNeuronControlled,
        identity: mockIdentity,
      })
    ).toEqual({ ...mockNeuronControlled, controlledByNNSDapp: true }));

  it("should map neuron to a not controlled by nns dapp neuron", () =>
    expect(
      mapHardwareWalletNeuronInfo({
        neuron: mockNeuronNotControlled,
        identity: mockIdentity,
      })
    ).toEqual({ ...mockNeuronNotControlled, controlledByNNSDapp: false }));
});
