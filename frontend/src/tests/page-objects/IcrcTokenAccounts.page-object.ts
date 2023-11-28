import { BaseAccountsPo } from "$tests/page-objects/BaseAccounts.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IcrcTokenAccountsPo extends BaseAccountsPo {
  private static readonly TID = "icrc-token-accounts-component";

  static under(element: PageObjectElement): IcrcTokenAccountsPo {
    return new IcrcTokenAccountsPo(element.byTestId(IcrcTokenAccountsPo.TID));
  }
}
