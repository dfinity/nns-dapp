/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import * as api from "../../../../lib/api/governance.api";
import HardwareWalletNeuronAddHotkeyModal from "../../../../lib/modals/accounts/HardwareWalletNeuronAddHotkeyModal.svelte";
import { getLedgerIdentityProxy } from "../../../../lib/proxy/ledger.services.proxy";
import { authStore } from "../../../../lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import {
  mockHardwareWalletNeuronsStore,
  mockNeuronStake,
} from "../../../mocks/hardware-wallet-neurons.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import HardwareWalletAddNeuronHotkeyTest from "../../components/accounts/HardwareWalletAddNeuronHotkeyTest.svelte";

jest.mock("../../../../lib/proxy/ledger.services.proxy");

describe("HardwareWalletNeuronAddHotkeyModal", () => {
  const props = { testComponent: HardwareWalletNeuronAddHotkeyModal };

  const spyAddHotkey = jest
    .spyOn(api, "addHotkey")
    .mockImplementation(() => Promise.resolve());

  const spyGetNeuron = jest
    .spyOn(api, "queryNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron));

  jest.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);

  beforeAll(() => {
    (getLedgerIdentityProxy as jest.Mock).mockImplementation(() =>
      Promise.resolve(mockIdentity)
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

    const confirmButton = queryByTestId("confirm-yes") as HTMLButtonElement;
    expect(confirmButton).toBeInTheDocument();

    await fireEvent.click(confirmButton);

    await waitFor(() => expect(spyAddHotkey).toBeCalled());
    await waitFor(() => expect(spyGetNeuron).toBeCalled());

    const store = get(mockHardwareWalletNeuronsStore);
    expect(
      store.neurons.find(({ controlledByNNSDapp }) => !controlledByNNSDapp)
    ).toBeUndefined();
  });
});
