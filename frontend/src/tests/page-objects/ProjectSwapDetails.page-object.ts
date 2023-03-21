import { AmountDisplayPo } from "./AmountDisplay.page-object";

export class ProjectSwapDetailsPo {
  static readonly tid = "project-swap-details-component";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: Element): ProjectSwapDetailsPo | null {
    const el = element.querySelector(`[data-tid=${ProjectSwapDetailsPo.tid}]`);
    return el && new ProjectSwapDetailsPo(el);
  }

  getTotalSupply(): string {
    return AmountDisplayPo.under(
      this.root.querySelector("[data-tid=sns-total-token-supply]")
    ).getAmount();
  }
}
