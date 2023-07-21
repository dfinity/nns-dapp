import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotingCardPo extends BasePageObject {
  private static readonly TID = "voting-card-component";

  private constructor(root: PageObjectElement) {
    super(root);
  }

  static under(element: PageObjectElement): VotingCardPo {
    return new VotingCardPo(element.byTestId(VotingCardPo.TID));
  }

  getVoteYesButtonPo(): ButtonPo {
    return this.getButton("vote-yes");
  }

  getVoteNoButtonPo(): ButtonPo {
    return this.getButton("vote-no");
  }

  getConfirmYesButtonPo(): ButtonPo {
    return this.getButton("confirm-yes");
  }

  getConfirmNoButtonPo(): ButtonPo {
    return this.getButton("confirm-no");
  }

  waitForVotingComplete(): Promise<void> {
    return this.root.byTestId("spinner").waitForAbsent();
  }

  async voteYes(): Promise<void> {
    await this.getVoteYesButtonPo().click();
    await this.getConfirmYesButtonPo().click();
    await this.waitForVotingComplete();
  }
}
