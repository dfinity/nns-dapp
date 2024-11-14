import { startBusyNeuron } from "$lib/services/busy.services";
import * as busyStore from "$lib/stores/busy.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";

describe("busy-services", () => {
  let startBusySpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    startBusySpy = vi.spyOn(busyStore, "startBusy").mockImplementation(vi.fn());
  });

  it("call start busy without message if neuron is not controlled by hardware wallet", async () => {
    setAccountsForTesting({
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
    setAccountsForTesting({
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
