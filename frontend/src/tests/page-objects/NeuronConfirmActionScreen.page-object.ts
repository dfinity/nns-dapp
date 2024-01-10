import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NeuronConfirmActionScreenPo extends BasePageObject {
  private static readonly TID = "neuron-confirm-action-screen-component";

  static under(element: PageObjectElement): NeuronConfirmActionScreenPo {
    return new NeuronConfirmActionScreenPo(
      element.byTestId(NeuronConfirmActionScreenPo.TID)
    );
  }

  getConfirmButton(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "confirm-action-button",
    });
  }

  clickConfirmButton(): Promise<void> {
    return this.getConfirmButton().click();
  }
}
