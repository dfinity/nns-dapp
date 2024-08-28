import type { ButtonPo } from "$tests/page-objects/Button.page-object";
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

  getConfirmYesButton(): ButtonPo {
    return this.getButton("confirm-yes");
  }

  async confirmYes(): Promise<void> {
    await this.getConfirmYesButton().click();
    await this.waitForClosed();
  }
}
