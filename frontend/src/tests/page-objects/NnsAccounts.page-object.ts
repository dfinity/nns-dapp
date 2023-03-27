import { AccountCardPo } from "$tests/page-objects/AccountCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsAccountsPo extends BasePageObject {
  static readonly tid = "accounts-body";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): NnsAccountsPo {
    return new NnsAccountsPo(element.byTestId(NnsAccountsPo.tid));
  }

  getMainAccountCardPo(): AccountCardPo {
    // We assume the first card is the main card.
    return AccountCardPo.under(this.root);
  }
}
