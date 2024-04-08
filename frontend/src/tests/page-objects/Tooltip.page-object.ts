import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class TooltipPo extends BasePageObject {
  private static readonly TID = "tooltip-component";

  static under(element: PageObjectElement): TooltipPo {
    return new TooltipPo(element.byTestId(TooltipPo.TID));
  }

  getTooltipText(): Promise<string> {
    return assertNonNullish(this.root.querySelector(".tooltip")).getText();
  }

  getAriaDescribedBy(): Promise<string> {
    return this.root
      .querySelector(".tooltip-target")
      .getAttribute("aria-describedby");
  }

  getTooltipId(): Promise<string> {
    return this.root.querySelector(".tooltip").getAttribute("id");
  }
}
