import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { StakeNeuronToVotePo } from "$tests/page-objects/StakeNeuronToVote.page-object";
import { VotingConfirmationToolbarPo } from "$tests/page-objects/VotingConfirmationToolbar.page-object";
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

  getConfirmationToolbar(): VotingConfirmationToolbarPo {
    return VotingConfirmationToolbarPo.under(this.root);
  }

  hasVotingToolbar(): Promise<boolean> {
    return this.getConfirmationToolbar().isPresent();
  }

  getVotableNeurons(): PageObjectElement {
    return this.root.byTestId("votable-neurons");
  }

  getVotedNeurons(): PageObjectElement {
    return this.root.byTestId("voted-neurons");
  }

  getVotedNeuronHeadline(): PageObjectElement {
    return this.getVotedNeurons().byTestId("voted-neurons-headline");
  }

  async getVotedNeuronHeadlineText(): Promise<string> {
    return (await this.getVotedNeuronHeadline().getText()).trim();
  }

  getVotedNeuronHeadlineYesIcon(): PageObjectElement {
    return this.getVotedNeuronHeadline().byTestId("thumb-up");
  }

  getVotedNeuronHeadlineNoIcon(): PageObjectElement {
    return this.getVotedNeuronHeadline().byTestId("thumb-down");
  }

  getIneligibleNeurons(): PageObjectElement {
    return this.root.byTestId("ineligible-neurons");
  }

  async getIneligibleNeuronsHeaderText(): Promise<string> {
    return (
      await this.getIneligibleNeurons().byTestId("collapsible-header").getText()
    ).trim();
  }

  getVoteYesButtonPo(): ButtonPo {
    return this.getButton("vote-yes");
  }

  getVoteNoButtonPo(): ButtonPo {
    return this.getButton("vote-no");
  }

  getStakeNeuronToVotePo(): StakeNeuronToVotePo {
    return StakeNeuronToVotePo.under(this.root);
  }

  getSignInButtonPo(): ButtonPo {
    return this.getButton("login-button");
  }

  getSpinnerPo(): PageObjectElement {
    return this.root.byTestId("loading-neurons-spinner");
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
