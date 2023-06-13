import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { VotingConfirmationToolbarPo } from "./VotingConfirmationToolbar.page-object";

export class SnsVotingCardPo extends BasePageObject {
  private static readonly TID = "sns-voting-card-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): SnsVotingCardPo {
    return new SnsVotingCardPo(element.byTestId(SnsVotingCardPo.TID));
  }

  getConfirmationToolbar(): VotingConfirmationToolbarPo {
    return VotingConfirmationToolbarPo.under(this.root);
  }

  hasVotingToolbar(): Promise<boolean> {
    return this.getConfirmationToolbar().isPresent();
  }
}
