export class TooltipPo {
  static readonly tid = "tooltip-component";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== TooltipPo.tid) {
      throw new Error(`${root} is not an Tooltip`);
    }
    this.root = root;
  }

  static under(element: Element): TooltipPo | null {
    const el = element.querySelector(`[data-tid=${TooltipPo.tid}]`);
    return el && new TooltipPo(el);
  }

  getText(): string {
    return this.root.querySelector(".tooltip").textContent;
  }
}
