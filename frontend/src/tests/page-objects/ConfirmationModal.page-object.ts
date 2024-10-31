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

  getConfirmNoButton(): ButtonPo {
    return this.getButton("confirm-no");
  }

  async clickNo(): Promise<void> {
    await this.getConfirmNoButton().click();
  }

  async clickYes(): Promise<void> {
    await this.getConfirmYesButton().click();
  }

  async confirmYes(): Promise<void> {
    await this.clickYes();
    await this.waitForClosed();
  }
}
