import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BackdropPo extends BasePageObject {
  private static readonly TID = "backdrop";

  static under(element: PageObjectElement): BackdropPo {
    return new BackdropPo(element.byTestId(BackdropPo.TID));
  }
}
