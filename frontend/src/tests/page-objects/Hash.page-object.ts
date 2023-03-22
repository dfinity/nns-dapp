import { BasePageObject } from "$tests/page-objects/base.page-object";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class HashPo extends BasePageObject {
  static readonly tid = "hash-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): HashPo {
    return new HashPo(element.querySelector(`[data-tid=${HashPo.tid}]`));
  }

  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  getText(): Promise<string> {
    return this.getTooltipPo().getText();
  }
}
