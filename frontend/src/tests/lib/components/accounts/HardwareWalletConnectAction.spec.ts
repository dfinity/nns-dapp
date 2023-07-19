import HardwareWalletConnectAction from "$lib/components/accounts/HardwareWalletConnectAction.svelte";
import { LedgerConnectionState } from "$lib/constants/ledger.constants";
import { connectToHardwareWalletProxy } from "$lib/proxy/icp-ledger.services.proxy";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import type { Mock } from "vitest";

vi.mock("$lib/proxy/icp-ledger.services.proxy");

describe("HardwareWalletConnectAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should render a small explanation text", () => {
    const { queryByText } = render(HardwareWalletConnectAction);

    expect(
      queryByText(en.accounts.connect_hardware_wallet_text)
    ).toBeInTheDocument();
  });

  describe("connecting", () => {
    beforeAll(() => {
      (connectToHardwareWalletProxy as Mock).mockImplementation(
        async (callback) =>
          callback({ connectionState: LedgerConnectionState.CONNECTING })
      );
    });

    it("should display a spinner while connecting", async () => {
      const { getByRole, getByTestId } = render(HardwareWalletConnectAction);

      fireEvent.click(getByRole("button"));

      await waitFor(() => expect(getByTestId("spinner")).not.toBeNull());
    });
  });

  describe("connected", () => {
    beforeAll(() => {
      (connectToHardwareWalletProxy as Mock).mockImplementation(
        async (callback) =>
          callback({
            connectionState: LedgerConnectionState.CONNECTED,
            ledgerIdentity: mockIdentity,
          })
      );
    });

    it("should display a connected information", async () => {
      const { getByRole, getByText, getByTestId } = render(
        HardwareWalletConnectAction
      );

      fireEvent.click(getByRole("button"));

      await waitFor(() =>
        expect(getByTestId("hardware-wallet-principal")).toBeInTheDocument()
      );

      expect(getByText(en.core.principal)).toBeInTheDocument();
      expect(
        getByText(mockIdentity.getPrincipal().toString())
      ).toBeInTheDocument();
    });
  });

  describe("not connected", () => {
    beforeAll(() => {
      (connectToHardwareWalletProxy as Mock).mockImplementation(
        async (callback) =>
          callback({
            connectionState: LedgerConnectionState.NOT_CONNECTED,
          })
      );
    });

    it("should reactive action if not connected", async () => {
      const { getByRole } = render(HardwareWalletConnectAction);

      fireEvent.click(getByRole("button"));

      await tick();

      expect(getByRole("button")).not.toBeNull();
    });
  });
});
