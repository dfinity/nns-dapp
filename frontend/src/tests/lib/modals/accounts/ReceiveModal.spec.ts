import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import ReceiveModal from "$lib/modals/accounts/ReceiveModal.svelte";
import type { Account } from "$lib/types/account";
import {
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { ReceiveModalPo } from "$tests/page-objects/ReceiveModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import type { Principal } from "@dfinity/principal";

describe("ReceiveModal", () => {
  const reloadSpy = vi.fn();

  const qrCodeLabel = "test QR code";
  const logo = "logo";
  const logoArialLabel = "logo aria-label";
  const tokenSymbol = "TST";

  const renderReceiveModal = async ({
    canSelectAccount = false,
    account = mockMainAccount,
    universeId,
  }: {
    canSelectAccount?: boolean;
    account?: Account;
    universeId: Principal;
  }) => {
    const { container } = await renderModal({
      component: ReceiveModal,
      props: {
        account,
        qrCodeLabel,
        logo,
        logoArialLabel,
        reload: reloadSpy,
        universeId,
        canSelectAccount,
        tokenSymbol,
      },
    });
    return ReceiveModalPo.under(new JestPageObjectElement(container));
  };

  it("should render a QR code", async () => {
    const po = await renderReceiveModal({
      universeId: OWN_CANISTER_ID,
    });

    expect(await po.hasQrCode()).toBe(true);
  });

  it("should render token symbol in title", async () => {
    const po = await renderReceiveModal({
      universeId: OWN_CANISTER_ID,
    });

    expect(await po.getModalTitle()).toBe(`Receive ${tokenSymbol}`);
  });

  it("should render account identifier (without being shortened)", async () => {
    const po = await renderReceiveModal({
      account: mockMainAccount,
      universeId: OWN_CANISTER_ID,
    });

    expect(await po.getAddress()).toBe(mockMainAccount.identifier);
  });

  it("should render a logo", async () => {
    const po = await renderReceiveModal({
      universeId: OWN_CANISTER_ID,
    });

    expect(await po.getLogoAltText()).toBe(logoArialLabel);
  });

  it("should reload account", async () => {
    const po = await renderReceiveModal({
      universeId: OWN_CANISTER_ID,
    });

    await po.clickFinish();

    expect(reloadSpy).toHaveBeenCalled();
  });

  it("should render a dropdown to select account", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: undefined,
      hardwareWallets: undefined,
    });

    const po = await renderReceiveModal({
      canSelectAccount: true,
      universeId: OWN_CANISTER_ID,
    });

    expect(await po.getSelectAccountDropdownPo().isPresent()).toBe(true);
  });

  it("should select account", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      hardwareWallets: undefined,
    });

    const po = await renderReceiveModal({
      canSelectAccount: true,
      account: undefined,
      universeId: OWN_CANISTER_ID,
    });

    // Main account is selected by default
    expect(await po.getAddress()).toBe(mockMainAccount.identifier);

    await po.select(mockSubAccount.identifier);

    expect(await po.getAddress()).toBe(mockSubAccount.identifier);
  });

  it("should not require universeId ", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [mockSubAccount],
      hardwareWallets: undefined,
    });

    const po = await renderReceiveModal({
      canSelectAccount: true,
      account: undefined,
      universeId: undefined,
    });

    // universeId is only required to render the account picker.
    // So the ReceiveModal render fine without universeId but it won't render
    // the account picker.
    expect(await po.getSelectAccountDropdownPo().isPresent()).toBe(false);
  });
});
