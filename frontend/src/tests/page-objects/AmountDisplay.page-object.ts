import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class AmountDisplayPo {
  static readonly tid = "token-value-label";

  root: Element;

  private constructor(root: Element) {
    this.root = root;
  }

  static under(element: Element): AmountDisplayPo | null {
    const el = element.querySelector(`[data-tid=${AmountDisplayPo.tid}]`);
    return el && new AmountDisplayPo(el);
  }

  getAmount(): string | null {
    return assertNonNullish(this.root.querySelector(`[data-tid="token-value"]`))
      .textContent;
  }
}
