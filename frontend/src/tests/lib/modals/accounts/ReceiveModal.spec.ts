/**
 * @jest-environment jsdom
 */

import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
import { fireEvent, waitFor } from "@testing-library/svelte";
import { mockMainAccount } from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";

describe("ReceiveModal", () => {
  const reloadAccountSpy = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  const qrCodeLabel = "test QR code";
  const logo = "logo";
  const logoArialLabel = "logo aria-label";

  const renderReceiveModal = () =>
    renderModal({
      component: ReceiveModal,
      props: {
        account: mockMainAccount,
        qrCodeLabel,
        logo,
        logoArialLabel,
        reloadAccount: reloadAccountSpy,
        qrCodeRendered: true,
      },
    });

  it("should render a QR code", async () => {
    const { getByTestId } = await renderReceiveModal();

    expect(getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should render account identifier (without being shortened)", async () => {
    const { getByText } = await renderReceiveModal();

    await waitFor(() =>
      expect(getByText(mockMainAccount.identifier)).toBeInTheDocument()
    );
  });

  it("should render a logo", async () => {
    const { getByTestId, container } = await renderReceiveModal();

    await waitFor(() =>
      expect(getByTestId("logo")?.getAttribute("alt")).toEqual(logoArialLabel)
    );
  });

  it("should reload account", async () => {
    const { getByTestId, container } = await renderReceiveModal();

    fireEvent.click(getByTestId("reload-receive-account") as HTMLButtonElement);

    await waitFor(() => expect(reloadAccountSpy).toHaveBeenCalled());
  });
});
