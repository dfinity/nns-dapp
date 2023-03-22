import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class AmountDisplayPo {
  static readonly tid = "token-value-label";

  root: PageObjectElement;

  private constructor(root: PageObjectElement) {
    this.root = root;
  }

  static under(element: PageObjectElement): AmountDisplayPo | null {
    const el = element.querySelector(`[data-tid=${AmountDisplayPo.tid}]`);
    return el && new AmountDisplayPo(el);
  }

  getAmount(): string | null {
    return assertNonNullish(this.root.querySelector(`[data-tid="token-value"]`))
      .textContent;
  }
}
