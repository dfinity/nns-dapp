import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmationModalPo extends ModalPo {
  private static CONFIRMATION_MODAL_TID = "confirmation-modal-component";

  static under(element: PageObjectElement): ConfirmationModalPo {
    return new ConfirmationModalPo(
      element.byTestId(ConfirmationModalPo.CONFIRMATION_MODAL_TID)
    );
  }

  async getContentText(): Promise<string> {
    return (await this.getText("confirmation-modal-content")).trim();
  }

  async confirmYes(): Promise<void> {
    await this.click("confirm-yes");
    await this.waitForClosed();
  }
}
