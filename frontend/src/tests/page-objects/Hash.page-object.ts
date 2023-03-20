import { TooltipPo } from "./Tooltip.page-object";

export class HashPo {
  static readonly tid = "hash-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== HashPo.tid) {
      throw new Error(`${root} is not an Hash`);
    }
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
