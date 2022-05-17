import { startBusyNeuron } from "../../../lib/services/busy.services";
import { accountsStore } from "../../../lib/stores/accounts.store";
import * as busyStore from "../../../lib/stores/busy.store";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "../../mocks/accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "../../mocks/neurons.mock";

describe("busy-services", () => {
  const startBusySpy = jest
    .spyOn(busyStore, "startBusy")
    .mockImplementation(jest.fn());

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("call start busy without message if neuron is not controlled by hardware wallet", async () => {
    accountsStore.set({
      main: mockMainAccount,
    });
    const neuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: mockMainAccount.principal?.toText() as string,
      },
    };
    neuronsStore.setNeurons({ neurons: [neuron], certified: true });
    const initiator = "add-hotkey-neuron";
    await startBusyNeuron({
      initiator,
      neuronId: neuron.neuronId,
    });
    expect(startBusySpy).toBeCalledWith({ initiator });
  });

  it("call start busy with message if neuron controlled by hardware wallet", async () => {
    accountsStore.set({
      main: mockMainAccount,
      hardwareWallets: [mockHardwareWalletAccount],
    });
    const neuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        controller: mockHardwareWalletAccount.principal?.toText() as string,
      },
    };
    neuronsStore.setNeurons({ neurons: [neuron], certified: true });
    const initiator = "add-hotkey-neuron";
    await startBusyNeuron({
      initiator,
      neuronId: neuron.neuronId,
    });
    expect(startBusySpy).toBeCalledWith({
      initiator,
      labelKey: "busy_screen.pending_approval_hw",
    });
  });
});
