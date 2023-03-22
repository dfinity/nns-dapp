import { AmountDisplayPo } from "$tests/page-objects/AmountDisplay.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProjectSwapDetailsPo {
  static readonly tid = "project-swap-details-component";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): ProjectSwapDetailsPo | null {
    const el = element.querySelector(`[data-tid=${ProjectSwapDetailsPo.tid}]`);
    return el && new ProjectSwapDetailsPo(el);
  }

  getTotalSupply(): Promise<string> {
    return AmountDisplayPo.under(
      this.root.querySelector("[data-tid=sns-total-token-supply]")
    ).getAmount();
  }
}
