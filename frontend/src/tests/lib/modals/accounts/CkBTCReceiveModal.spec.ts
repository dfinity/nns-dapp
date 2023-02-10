/**
 * @jest-environment jsdom
 */

import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
import { fireEvent, waitFor } from "@testing-library/svelte";
import {
  mockCkBTCAddress,
  mockCkBTCMainAccount,
} from "../../../mocks/ckbtc-accounts.mock";
import en from "../../../mocks/i18n.mock";
import { renderModal } from "../../../mocks/modal.mock";

describe("CkBTCReceiveModal", () => {
  const renderTransactionModal = () =>
    renderModal({
      component: CkBTCReceiveModal,
      props: {
        data: {
          account: mockCkBTCMainAccount,
          btcAddress: mockCkBTCAddress,
        },
      },
    });

  it("should render BTC address", async () => {
    const { getByText } = await renderTransactionModal();

    expect(getByText(mockCkBTCAddress)).toBeInTheDocument();
  });

  const selectCkBTC = async (container: HTMLElement) => {
    const button = container.querySelector(
      "div.segment-button:nth-of-type(3) button"
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();

    await fireEvent.click(button);
  };

  it("should render account identifier (without being shortened)", async () => {
    const { getByText, container } = await renderTransactionModal();

    await selectCkBTC(container);

    await waitFor(() =>
      expect(getByText(mockCkBTCMainAccount.identifier)).toBeInTheDocument()
    );
  });

  it("should render a QR code", async () => {
    const { getByTestId } = await renderTransactionModal();

    expect(getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should render a bitcoin description", async () => {
    const { getByText } = await renderTransactionModal();

    expect(getByText(en.ckbtc.btc_receive_note)).toBeInTheDocument();
  });

  it("should render a ckBTC description", async () => {
    const { getByText, container } = await renderTransactionModal();

    await selectCkBTC(container);

    await waitFor(() =>
      expect(getByText(en.ckbtc.ckBTC_receive_note)).toBeInTheDocument()
    );
  });

  it("should render a bitcoin logo", async () => {
    const { getByTestId } = await renderTransactionModal();

    expect(getByTestId("logo")?.getAttribute("alt")).toEqual(en.ckbtc.bitcoin);
  });

  it("should render ckBTC logo", async () => {
    const { getByTestId, container } = await renderTransactionModal();

    await selectCkBTC(container);

    await waitFor(() =>
      expect(getByTestId("logo")?.getAttribute("alt")).toEqual(en.ckbtc.title)
    );
  });
});
