import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ConfirmFollowingButtonPo } from "./ConfirmFollowingButton.page-object";
import { NnsLosingRewardsNeuronCardPo } from "./NnsLosingRewardsNeuronCard.page-object";

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

  async clickConfirmFollowing(): Promise<void> {
    return this.getConfirmFollowingButtonPo().click();
  }

  async clickCancel(): Promise<void> {
    return this.getButton("cancel-button").click();
  }
}
