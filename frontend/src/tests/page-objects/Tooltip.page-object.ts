import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class TooltipPo {
  static readonly tid = "tooltip-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): TooltipPo | null {
    const el = element.querySelector(`[data-tid=${TooltipPo.tid}]`);
    return el && new TooltipPo(el);
  }

  getText(): string {
    return assertNonNullish(this.root.querySelector(".tooltip")).textContent;
  }
}
