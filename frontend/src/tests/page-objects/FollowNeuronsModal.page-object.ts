import { AddUserToHotkeysPo } from "$tests/page-objects/AddUserToHotkeys.page-object";
import { ConfirmDissolveDelayPo } from "$tests/page-objects/ConfirmDissolveDelay.page-object";
import { EditFollowNeuronsPo } from "$tests/page-objects/EditFollowNeurons.page-object";
import { NnsStakeNeuronPo } from "$tests/page-objects/NnsStakeNeuron.page-object";
import { SetDissolveDelayPo } from "$tests/page-objects/SetDissolveDelay.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNeuronsModalPo extends ModalPo {
  private static readonly TID = "follow-neurons-modal-component";

  static under(element: PageObjectElement): FollowNeuronsModalPo | null {
    return new FollowNeuronsModalPo(
      element.byTestId(FollowNeuronsModalPo.TID)
    );
  }

  getEditFollowNeuronsPo(): EditFollowNeuronsPo {
    return EditFollowNeuronsPo.under(this.root);
  }
}
