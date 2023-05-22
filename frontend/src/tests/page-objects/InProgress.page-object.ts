import { AmountInputPo } from "$tests/page-objects/AmountInput.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { SelectDestinationAddressPo } from "$tests/page-objects/SelectDestinationAddress.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class InProgressPo extends BasePageObject {
  private static readonly TID = "in-progress-component";

  static under(element: PageObjectElement): InProgressPo {
    return new InProgressPo(element.byTestId(InProgressPo.TID));
  }
}
