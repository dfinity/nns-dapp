/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import * as api from "../../../../lib/api/governance.api";
import HardwareWalletNeuronAddHotkeyModal from "../../../../lib/modals/accounts/HardwareWalletNeuronAddHotkeyModal.svelte";
import { getLedgerIdentityProxy } from "../../../../lib/proxy/ledger.services.proxy";
import { authStore } from "../../../../lib/stores/auth.store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockNeuron } from "../../../mocks/neurons.mock";
import HardwareWalletAddNeuronHotkeyTest from "../../components/accounts/HardwareWalletAddNeuronHotkeyTest.svelte";
import {mockNeuronStake} from '../../../mocks/hardware-wallet-neurons.store.mock';
jest.mock("../../../../lib/proxy/ledger.services.proxy");

describe("HardwareWalletNeuronAddHotkeyModal", () => {
  const props = { testComponent: HardwareWalletNeuronAddHotkeyModal };

  describe("success", () => {
    const spyAddHotkey = jest
      .spyOn(api, "addHotkey")
      .mockImplementation(() => Promise.resolve());

    const spyGetNeuron = jest
      .spyOn(api, "queryNeuron")
      .mockImplementation(() => Promise.resolve(mockNeuron));

    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);

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

    it("should render user principal",  () => {
      const { getByText } = render(HardwareWalletAddNeuronHotkeyTest, {
        props,
      });

      expect(
          getByText(mockIdentity.getPrincipal().toString(), { exact: false })
      ).toBeInTheDocument()
    });

    it("should render selected neuron id",  () => {
      const { getByText } = render(HardwareWalletAddNeuronHotkeyTest, {
        props,
      });

      expect(
          getByText(mockNeuronStake.neuronId.toString(), { exact: false })
      ).toBeInTheDocument()
    });
  });

  describe("errors", () => {});
});
