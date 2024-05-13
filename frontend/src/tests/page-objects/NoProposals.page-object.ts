import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NoProposalsPo extends BasePageObject {
  private static readonly TID = "no-proposals-msg";

  static under(element: PageObjectElement): NoProposalsPo {
    return new NoProposalsPo(element.byTestId(NoProposalsPo.TID));
  }
}
