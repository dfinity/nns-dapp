import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";

export class HashPo {
  static readonly tid = "hash-component";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: Element): HashPo | null {
    const el = element.querySelector(`[data-tid=${HashPo.tid}]`);
    return el && new HashPo(el);
  }

  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  getText(): string {
    return this.getTooltipPo().getText();
  }
}
