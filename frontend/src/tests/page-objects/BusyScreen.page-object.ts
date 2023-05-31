import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BusyScreenPo extends BasePageObject {
  static readonly TID = "busy";

  static under(element: PageObjectElement): BusyScreenPo {
    return new BusyScreenPo(element.byTestId(BusyScreenPo.TID));
  }
}
