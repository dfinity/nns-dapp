import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotingConfirmationToolbarPo extends BasePageObject {
  private static readonly TID = "voting-confirmation-toolbar";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): VotingConfirmationToolbarPo {
    return new VotingConfirmationToolbarPo(
      element.byTestId(VotingConfirmationToolbarPo.TID)
    );
  }

  getVoteYesButtonPo(): ButtonPo {
    return this.getButton("vote-yes");
  }

  getVoteNoButtonPo(): ButtonPo {
    return this.getButton("vote-no");
  }
}
