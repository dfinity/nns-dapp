import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class TooltipPo extends BasePageObject {
  static readonly tid = "tooltip-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): TooltipPo | null {
    const el = element.querySelector(`[data-tid=${TooltipPo.tid}]`);
    return el && new TooltipPo(el);
  }

  getText(): Promise<string> {
    return assertNonNullish(this.root.querySelector(".tooltip")).getText();
  }
}
