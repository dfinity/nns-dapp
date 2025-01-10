import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { SelectAccountDropdownPo } from "$tests/page-objects/SelectAccountDropdown.page-object";

export class ReceiveModalPo extends ModalPo {
  private static readonly TID = "receive-modal";

  static under(element: PageObjectElement): ReceiveModalPo {
    return new ReceiveModalPo(element.byTestId(ReceiveModalPo.TID));
  }

  getFinishButtonPo(): ButtonPo {
    return this.getButton("reload-receive-account");
  }

  clickFinish(): Promise<void> {
    return this.getFinishButtonPo().click();
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

  getSelectAccountDropdownPo() {
    return SelectAccountDropdownPo.under(this.root);
  }

  select(accountIdentifier: string) {
    return this.getSelectAccountDropdownPo().select(accountIdentifier);
  }
}
