/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import HardwareWalletConnectAction from "../../../../lib/components/accounts/HardwareWalletConnectAction.svelte";
import { connectToHardwareWalletProxy } from "../../../../lib/proxy/ledger.services.proxy";
import en from "../../../mocks/i18n.mock";
import {LedgerConnectionState} from '../../../../lib/constants/ledger.constants';

jest.mock("../../../../lib/proxy/ledger.services.proxy");

describe("HardwareWalletConnectAction", () => {
  beforeAll(() => {
    (connectToHardwareWalletProxy as jest.Mock).mockImplementation(async (callback) =>
        callback({ connectionState: LedgerConnectionState.CONNECTING })
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should render a small explanation text", () => {
    const { queryByText } = render(HardwareWalletConnectAction);

    expect(
      queryByText(en.accounts.connect_hardware_wallet_text)
    ).toBeInTheDocument();
  });

  it("should display a spinner while connecting", async () => {
    const { getByRole, getByTestId } = render(HardwareWalletConnectAction);

    fireEvent.click(getByRole("button"));

    await waitFor(() => expect(getByTestId("spinner")).not.toBeNull());

    // expect(spy).toHaveBeenCalled();
  });
});
