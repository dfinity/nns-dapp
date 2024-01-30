import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import type { Account } from "$lib/types/account";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";

describe("ReceiveModal", () => {
  const reloadSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    icpAccountsStore.resetForTesting();
  });

  const qrCodeLabel = "test QR code";
  const logo = "logo";
  const logoArialLabel = "logo aria-label";

  const renderReceiveModal = async ({
    canSelectAccount = false,
    account = mockMainAccount,
  }: {
    canSelectAccount?: boolean;
    account?: Account;
  }) => {
    const { container, getByTestId, getByText } = await renderModal({
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
    return ReceiveModalPo.under(new JestPageObjectElement(container));
  };

  it("should render a QR code", async () => {
    const po = await renderReceiveModal({});

    expect(await po.hasQrCode()).toBe(true);
  });

  it("should render account identifier (without being shortened)", async () => {
    const po = await renderReceiveModal({
      account: mockMainAccount,
    });

    expect(await po.getAddress()).toBe(mockMainAccount.identifier);
  });

  it("should render a logo", async () => {
    const po = await renderReceiveModal({});

    expect(await po.getLogoAltText()).toBe(logoArialLabel);
  });

  it("should reload account", async () => {
    const po = await renderReceiveModal({});

    await po.clickFinish();

    expect(reloadSpy).toHaveBeenCalled();
  });

  it("should render a dropdown to select account", async () => {
    icpAccountsStore.setForTesting({
      main: mockMainAccount,
      subAccounts: undefined,
      hardwareWallets: undefined,
    });

    const po = await renderReceiveModal({
      canSelectAccount: true,
    });

    expect(await po.getDropdownAccounts().isPresent()).toBe(true);
  });

  it("should select account", async () => {
    icpAccountsStore.setForTesting({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      hardwareWallets: undefined,
    });

    const po = await renderReceiveModal({
      canSelectAccount: true,
      account: undefined,
    });

    // Main account is selected by default
    expect(await po.getAddress()).toBe(mockMainAccount.identifier);

    await po.select(mockSubAccount.identifier);

    expect(await po.getAddress()).toBe(mockSubAccount.identifier);
  });
});
