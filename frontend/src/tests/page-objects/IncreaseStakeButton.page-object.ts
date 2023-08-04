import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IncreaseStakeButtonPo extends BasePageObject {
  private static readonly TID = "increase-stake-button-component";

  static under(element: PageObjectElement): IncreaseStakeButtonPo {
    return new IncreaseStakeButtonPo(element.byTestId(IncreaseStakeButtonPo.TID));
  }

  async getVariant(): Promise<string> {
    const allowedVariants = ["primary", "secondary"];
    const classes = (await this.root.getClasses()).filter((c) => allowedVariants.includes(c));
    if (classes.length !== 1) {
      throw new Error(`Expected one of ${allowedVariants.join(", ")} but got ${classes.join(", ")}`);
    }
    return classes[0];
  }
}
