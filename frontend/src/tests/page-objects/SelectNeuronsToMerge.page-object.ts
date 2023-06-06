import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { NnsNeuronCardPo } from "$tests/page-objects/NnsNeuronCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectNeuronsToMergePo extends BasePageObject {
  static readonly TID = "select-neurons-to-merge-component";

  static under(element: PageObjectElement): SelectNeuronsToMergePo {
    return new SelectNeuronsToMergePo(
      element.byTestId(SelectNeuronsToMergePo.TID)
    );
  }

  getNnsNeuronCardPos(): Promise<NnsNeuronCardPo[]> {
    return NnsNeuronCardPo.allUnder(this.root);
  }

  getConfirmSelectionButtonPo(): ButtonPo {
    return this.getButton("merge-neurons-confirm-selection-button");
  }
}
