import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { TextInputPo } from "$tests/page-objects/TextInput.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAddMaturityModalPo extends ModalPo {
  private static TID = "nns-add-maturity-modal-component";

  static under(element: PageObjectElement): NnsAddMaturityModalPo {
    return new NnsAddMaturityModalPo(
      element.byTestId(NnsAddMaturityModalPo.TID)
    );
  }

  getTextInputPo(): TextInputPo {
    return TextInputPo.under({ element: this.root });
  }

  async addMaturity(amount: number): Promise<void> {
    await this.getTextInputPo().typeText(amount.toString());
    await this.click("confirm-add-maturity-button");
    await this.waitForClosed();
  }
}
