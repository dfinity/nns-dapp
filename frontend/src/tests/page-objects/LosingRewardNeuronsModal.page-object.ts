import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
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

  async clickCancel(): Promise<void> {
    return this.getButton("cancel-button").click();
  }
}
