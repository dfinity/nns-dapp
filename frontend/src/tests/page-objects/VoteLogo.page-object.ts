import { LogoWrapperPo } from "$tests/page-objects/LogoWrapper.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VoteLogoPo extends LogoWrapperPo {
  private static readonly TID = "vote-logo-component";

  static under(element: PageObjectElement): VoteLogoPo {
    return new VoteLogoPo(element.byTestId(VoteLogoPo.TID));
  }
}
