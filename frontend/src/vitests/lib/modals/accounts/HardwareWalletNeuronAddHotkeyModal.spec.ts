import * as api from "$lib/api/governance.api";
import HardwareWalletNeuronAddHotkeyModal from "$lib/modals/accounts/HardwareWalletNeuronAddHotkeyModal.svelte";
import { getLedgerIdentityProxy } from "$lib/proxy/icp-ledger.services.proxy";
import { authStore } from "$lib/stores/auth.store";
import {
  createMockIdentity,
  mockAuthStoreSubscribe,
  mockIdentity,
  resetIdentity,
} from "$tests/mocks/auth.store.mock";
import {
  mockHardwareWalletNeuronsStore,
  mockNeuronStake,
} from "$tests/mocks/hardware-wallet-neurons.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import HardwareWalletAddNeuronHotkeyTest from "$vitests/lib/components/accounts/HardwareWalletAddNeuronHotkeyTest.svelte";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/proxy/icp-ledger.services.proxy");

describe("HardwareWalletNeuronAddHotkeyModal", () => {
  const props = { testComponent: HardwareWalletNeuronAddHotkeyModal };
  let spyAddHotkey;
  let spyGetNeuron;

  const mockIdentity2 = createMockIdentity(0);

  beforeEach(() => {
    vi.restoreAllMocks();
    resetIdentity();
    (getLedgerIdentityProxy as vi.Mock).mockImplementation(() =>
      Promise.resolve(mockIdentity2)
    );
    spyAddHotkey = vi
      .spyOn(api, "addHotkey")
      .mockImplementation(() => Promise.resolve());

    spyGetNeuron = vi
      .spyOn(api, "queryNeuron")
      .mockImplementation(() => Promise.resolve(mockNeuron));

    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  it("should display modal", () => {
    const { container } = render(HardwareWalletAddNeuronHotkeyTest, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = render(HardwareWalletAddNeuronHotkeyTest, {
      props,
    });

    expect(
      getByText(en.accounts.hardware_wallet_add_hotkey_title)
    ).toBeInTheDocument();
  });

  it("should render user principal", () => {
    const { getByText } = render(HardwareWalletAddNeuronHotkeyTest, {
      props,
    });

    expect(
      getByText(mockIdentity.getPrincipal().toString(), { exact: false })
    ).toBeInTheDocument();
  });

  it("should render selected neuron id", () => {
    const { getByText } = render(HardwareWalletAddNeuronHotkeyTest, {
      props,
    });

    expect(
      getByText(mockNeuronStake.neuronId.toString(), { exact: false })
    ).toBeInTheDocument();
  });

  it("should not add current user to hokey if user cancel modal", async () => {
    const { queryByTestId } = render(HardwareWalletAddNeuronHotkeyTest, {
      props,
    });

    const confirmNoButton = queryByTestId("confirm-no") as HTMLButtonElement;
    expect(confirmNoButton).toBeInTheDocument();

    await fireEvent.click(confirmNoButton);

    expect(spyAddHotkey).not.toBeCalled();
    expect(spyGetNeuron).not.toBeCalled();
  });

  it("should add current user to hotkey and update context", async () => {
    const { queryByTestId } = render(HardwareWalletAddNeuronHotkeyTest, {
      props,
    });

    expect(spyAddHotkey).not.toBeCalled();
    expect(spyGetNeuron).not.toBeCalled();

    const confirmButton = queryByTestId("confirm-yes") as HTMLButtonElement;
    expect(confirmButton).toBeInTheDocument();

    await fireEvent.click(confirmButton);

    await waitFor(() =>
      expect(spyAddHotkey).toBeCalledWith({
        neuronId: mockNeuronStake.neuronId,
        principal: mockIdentity.getPrincipal(),
        // It uses the ledger identity to add the hotkey
        identity: mockIdentity2,
      })
    );
    await waitFor(() =>
      expect(spyGetNeuron).toBeCalledWith({
        neuronId: mockNeuronStake.neuronId,
        // Once the hotkey is added, it uses the current identity to query the neuron
        identity: mockIdentity,
        certified: true,
      })
    );

    const store = get(mockHardwareWalletNeuronsStore);
    expect(
      store.neurons.find(({ controlledByNNSDapp }) => !controlledByNNSDapp)
    ).toBeUndefined();
  });
});
