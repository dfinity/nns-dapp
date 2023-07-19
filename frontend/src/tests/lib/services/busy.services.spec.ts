import { startBusyNeuron } from "$lib/services/busy.services";
import * as busyStore from "$lib/stores/busy.store";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";

describe("busy-services", () => {
  const startBusySpy = vi
    .spyOn(busyStore, "startBusy")
    .mockImplementation(vi.fn());

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("call start busy without message if neuron is not controlled by hardware wallet", async () => {
    icpAccountsStore.setForTesting({
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
    icpAccountsStore.setForTesting({
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
