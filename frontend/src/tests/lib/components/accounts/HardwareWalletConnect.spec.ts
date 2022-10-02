/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import HardwareWalletConnect from "../../../../lib/components/accounts/HardwareWalletConnect.svelte";
import { LedgerConnectionState } from "../../../../lib/constants/ledger.constants";
import {
  connectToHardwareWalletProxy,
  registerHardwareWalletProxy,
} from "../../../../lib/proxy/ledger.services.proxy";
import { addAccountStoreMock } from "../../../mocks/add-account.store.mock";
import { mockIdentity } from "../../../mocks/auth.store.mock";
import AddAccountTest from "./AddAccountTest.svelte";

jest.mock("../../../../lib/proxy/ledger.services.proxy");

describe("HardwareWalletConnect", () => {
  const props = { testComponent: HardwareWalletConnect };

  beforeAll(() => {
    addAccountStoreMock.set({
      type: "hardwareWallet",
      hardwareWalletName: undefined,
    });

    (connectToHardwareWalletProxy as jest.Mock).mockImplementation(
      async (callback) =>
        callback({
          connectionState: LedgerConnectionState.CONNECTED,
          ledgerIdentity: mockIdentity,
        })
    );

    (registerHardwareWalletProxy as jest.Mock).mockImplementation(async () => {
      // Do nothing test
    });
  });

  afterAll(() => {
    addAccountStoreMock.set({
      type: undefined,
      hardwareWalletName: undefined,
    });

    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should render a connect action", () => {
    const { getByTestId } = render(AddAccountTest, {
      props,
    });

    expect(getByTestId("ledger-connect-button")).not.toBeNull();
  });

  it("should not enable attach action if not connected", () => {
    const { queryByTestId } = render(AddAccountTest, {
      props,
    });

    const attachButton = queryByTestId(
      "ledger-attach-button"
    ) as HTMLButtonElement;

    expect(attachButton).toBeNull();
  });

  it("should enable attach action if connected", async () => {
    const { getByTestId } = render(AddAccountTest, {
      props,
    });

    const connect = getByTestId("ledger-connect-button") as HTMLButtonElement;

    fireEvent.click(connect);

    await waitFor(() => {
      const button = getByTestId("ledger-attach-button") as HTMLButtonElement;

      expect(button.getAttribute("disabled")).toBeNull();
    });
  });

  it("should call attach wallet action", async () => {
    const { getByTestId } = render(AddAccountTest, {
      props,
    });

    const connect = getByTestId("ledger-connect-button") as HTMLButtonElement;

    fireEvent.click(connect);

    await waitFor(() => {
      const button = getByTestId("ledger-attach-button") as HTMLButtonElement;

      expect(button.getAttribute("disabled")).toBeNull();
    });

    const attach = getByTestId("ledger-attach-button") as HTMLButtonElement;

    fireEvent.click(attach);

    await waitFor(() => expect(registerHardwareWalletProxy).toHaveBeenCalled());
  });
});
