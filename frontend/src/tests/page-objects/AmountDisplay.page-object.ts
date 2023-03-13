import { assertNonNullish } from "../utils/utils.test-utils";

export class AmountDisplayPo {
  static readonly tid = "token-value-label";

  root: Element;

  constructor(root: Element) {
    if (root.getAttribute("data-tid") !== AmountDisplayPo.tid) {
      throw new Error(`${root} is not an Tooltip`);
    }
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
