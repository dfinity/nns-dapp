import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class DisburseMaturityButtonPo extends BasePageObject {
  private static readonly TID = "disburse-maturity-button-component";

  static under(element: PageObjectElement): DisburseMaturityButtonPo {
    return new DisburseMaturityButtonPo(
      element.byTestId(DisburseMaturityButtonPo.TID)
    );
  }

  getButton(): ButtonPo {
    return new ButtonPo(this.root.querySelector("button"));
  }

  isDisabled(): Promise<boolean> {
    return this.getButton().isDisabled();
  }
}
