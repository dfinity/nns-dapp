import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class MobileTokensListPo extends BasePageObject {
  private static readonly TID = "mobile-tokens-list-component";

  static under(element: PageObjectElement): MobileTokensListPo {
    return new MobileTokensListPo(element.byTestId(MobileTokensListPo.TID));
  }
}
