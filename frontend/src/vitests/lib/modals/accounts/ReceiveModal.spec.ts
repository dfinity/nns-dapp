import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import type { Account } from "$lib/types/account";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { fireEvent, waitFor } from "@testing-library/svelte";

describe("ReceiveModal", () => {
  const reloadSpy = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  const qrCodeLabel = "test QR code";
  const logo = "logo";
  const logoArialLabel = "logo aria-label";

  const renderReceiveModal = ({
    canSelectAccount = false,
    account = mockMainAccount,
  }: {
    canSelectAccount?: boolean;
    account?: Account;
  }) =>
    renderModal({
      component: ReceiveModal,
      props: {
        account,
        qrCodeLabel,
        logo,
        logoArialLabel,
        reload: reloadSpy,
        universeId: OWN_CANISTER_ID,
        canSelectAccount,
      },
    });

  it("should render a QR code", async () => {
    const { getByTestId } = await renderReceiveModal({});

    expect(getByTestId("qr-code")).toBeInTheDocument();
  });

  it("should render account identifier (without being shortened)", async () => {
    const { getByText } = await renderReceiveModal({});

    await waitFor(() =>
      expect(getByText(mockMainAccount.identifier)).toBeInTheDocument()
    );
  });

  it("should render a logo", async () => {
    const { getByTestId } = await renderReceiveModal({});

    await waitFor(() =>
      expect(getByTestId("logo").getAttribute("alt")).toEqual(logoArialLabel)
    );
  });

  it("should reload account", async () => {
    const { getByTestId } = await renderReceiveModal({});

    fireEvent.click(getByTestId("reload-receive-account") as HTMLButtonElement);

    await waitFor(() => expect(reloadSpy).toHaveBeenCalled());
  });

  it("should render a dropdown to select account", async () => {
    icpAccountsStore.setForTesting({
      main: mockMainAccount,
      subAccounts: undefined,
      hardwareWallets: undefined,
    });

    const { getByTestId } = await renderReceiveModal({
      canSelectAccount: true,
    });

    await waitFor(() =>
      expect(getByTestId("select-account-dropdown")).toBeInTheDocument()
    );
  });

  it("should select account", async () => {
    icpAccountsStore.setForTesting({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      hardwareWallets: undefined,
    });

    const { getByTestId, container } = await renderReceiveModal({
      canSelectAccount: true,
      account: undefined,
    });

    await waitFor(() =>
      expect(getByTestId("select-account-dropdown")).toBeInTheDocument()
    );

    const selectElement = container.querySelector("select");
    selectElement &&
      expect(selectElement.value).toBe(mockMainAccount.identifier);

    expect(getByTestId("qrcode-display-address")?.textContent).toEqual(
      mockMainAccount.identifier
    );

    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: mockSubAccount.identifier },
      });

    await waitFor(() =>
      expect(getByTestId("qrcode-display-address")?.textContent).toEqual(
        mockSubAccount.identifier
      )
    );
  });
});
