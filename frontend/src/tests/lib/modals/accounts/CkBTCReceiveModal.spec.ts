/**
 * @jest-environment jsdom
 */

import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
import * as services from "$lib/services/ckbtc-minter.services";
import { mockCkBTCAdditionalCanisters } from "$tests/mocks/canisters.mock";
import {
  mockBTCAddressTestnet,
  mockCkBTCMainAccount,
} from "$tests/mocks/ckbtc-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { fireEvent, waitFor } from "@testing-library/svelte";

jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    updateBalance: jest.fn().mockImplementation(() => undefined),
  };
});

describe("CkBTCReceiveModal", () => {
  const reloadAccountSpy = jest.fn();

  afterEach(() => jest.clearAllMocks());

  const renderTransactionModal = () =>
    renderModal({
      component: CkBTCReceiveModal,
      props: {
        data: {
          account: mockCkBTCMainAccount,
          btcAddress: mockBTCAddressTestnet,
          reloadAccount: reloadAccountSpy,
          canisters: mockCkBTCAdditionalCanisters,
        },
        qrCodeRendered: true,
      },
    });

  it("should render BTC address", async () => {
    const { getByText } = await renderTransactionModal();

    expect(getByText(mockBTCAddressTestnet)).toBeInTheDocument();
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
      expect(getByText(en.ckbtc.ckbtc_receive_note)).toBeInTheDocument()
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

  it("should update balance", async () => {
    const spyUpdateBalance = jest.spyOn(services, "updateBalance");

    const { getByTestId } = await renderTransactionModal();

    fireEvent.click(getByTestId("update-ckbtc-balance") as HTMLButtonElement);

    await waitFor(() => expect(spyUpdateBalance).toHaveBeenCalled());
  });

  it("should reload account after update balance", async () => {
    const { getByTestId } = await renderTransactionModal();

    fireEvent.click(getByTestId("update-ckbtc-balance") as HTMLButtonElement);

    await waitFor(() => expect(reloadAccountSpy).toHaveBeenCalled());
  });

  it("should only reload account", async () => {
    const spyUpdateBalance = jest.spyOn(services, "updateBalance");

    const { getByTestId, container } = await renderTransactionModal();

    await selectCkBTC(container);

    fireEvent.click(getByTestId("reload-ckbtc-account") as HTMLButtonElement);

    expect(spyUpdateBalance).not.toHaveBeenCalled();

    await waitFor(() => expect(reloadAccountSpy).toHaveBeenCalled());
  });
});
