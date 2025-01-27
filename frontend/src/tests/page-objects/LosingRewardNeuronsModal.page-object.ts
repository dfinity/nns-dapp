import { ConfirmFollowingButtonPo } from "$tests/page-objects/ConfirmFollowingButton.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { NnsLosingRewardsNeuronCardPo } from "$tests/page-objects/NnsLosingRewardsNeuronCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class LosingRewardNeuronsModalPo extends ModalPo {
  static readonly TID = "losing-reward-neurons-modal-component";

  static under(element: PageObjectElement): LosingRewardNeuronsModalPo {
    return new LosingRewardNeuronsModalPo(
      element.byTestId(LosingRewardNeuronsModalPo.TID)
    );
  }

  getNnsLosingRewardsNeuronCardPos(): Promise<NnsLosingRewardsNeuronCardPo[]> {
    return NnsLosingRewardsNeuronCardPo.allUnder(this.root);
  }

  getConfirmFollowingButtonPo(): ConfirmFollowingButtonPo {
    return ConfirmFollowingButtonPo.under(this.root);
  }

  hasDescription(): Promise<boolean> {
    return this.root.byTestId("losing-rewards-description").isPresent();
  }

  async clickConfirmFollowing(): Promise<void> {
    return this.getConfirmFollowingButtonPo().click();
  }

  async clickCancel(): Promise<void> {
    return this.getButton("cancel-button").click();
  }
}
