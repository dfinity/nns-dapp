import { BasePageObject } from "$tests/page-objects/base.page-object";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsFolloweePo extends BasePageObject {
  private static readonly TID = "sns-followee-component";

  static under(element: PageObjectElement): SnsFolloweePo {
    return new SnsFolloweePo(element.byTestId(SnsFolloweePo.TID));
  }

  getHashPo(): HashPo {
    return HashPo.under(this.root);
  }
}
