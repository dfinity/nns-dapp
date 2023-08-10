import { DisburseMaturityButtonPo } from "$tests/page-objects/DisburseMaturityButton.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsDisburseMaturityButtonPo extends BasePageObject {
  private static readonly TID = "sns-disburse-maturity-button-component";

  static under(element: PageObjectElement): SnsDisburseMaturityButtonPo {
    return new SnsDisburseMaturityButtonPo(
      element.byTestId(SnsDisburseMaturityButtonPo.TID)
    );
  }

  getDisburseMaturityButtonPo(): DisburseMaturityButtonPo {
    return DisburseMaturityButtonPo.under(this.root);
  }

  isDisabled(): Promise<boolean> {
    return this.getDisburseMaturityButtonPo().isDisabled();
  }
}
