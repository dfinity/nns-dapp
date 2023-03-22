import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class TooltipPo {
  static readonly tid = "tooltip-component";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: Element): TooltipPo | null {
    const el = element.querySelector(`[data-tid=${TooltipPo.tid}]`);
    return el && new TooltipPo(el);
  }

  getText(): string {
    return assertNonNullish(this.root.querySelector(".tooltip")).textContent;
  }
}
