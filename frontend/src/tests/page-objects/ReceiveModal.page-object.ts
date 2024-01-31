import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SelectAccountDropdownPo } from "./SelectAccountDropdown.page-object";

export class ReceiveModalPo extends ModalPo {
  private static readonly TID = "receive-modal";

  static under(element: PageObjectElement): ReceiveModalPo {
    return new ReceiveModalPo(element.byTestId(ReceiveModalPo.TID));
  }

  clickFinish(): Promise<void> {
    return this.click("reload-receive-account");
  }

  waitForQrCode(): Promise<void> {
    return this.waitFor("qr-code");
  }

  hasQrCode(): Promise<boolean> {
    return this.isPresent("qr-code");
  }

  async getLogoAltText(): Promise<string> {
    return this.root.byTestId("logo").getAttribute("alt");
  }

  async getTokenAddressLabel(): Promise<string> {
    return this.getText("token-address-label");
  }

  getAddress(): Promise<string> {
    return this.getText("qrcode-display-address");
  }

  getDropdownAccounts() {
    return SelectAccountDropdownPo.under(this.root);
  }

  select(accountIdentifier: string) {
    return this.getDropdownAccounts().select(accountIdentifier);
  }
}
