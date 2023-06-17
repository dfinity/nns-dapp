import { BaseAccountsPo } from "$tests/page-objects/BaseAccounts.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsAccountsPo extends BaseAccountsPo {
  private static readonly TID = "sns-accounts-body";

  static under(element: PageObjectElement): SnsAccountsPo {
    return new SnsAccountsPo(element.byTestId(SnsAccountsPo.TID));
  }
}
