import { AddUserToHotkeysPo } from "$tests/page-objects/AddUserToHotkeys.page-object";
import { ConfirmDissolveDelayPo } from "$tests/page-objects/ConfirmDissolveDelay.page-object";
import { EditFollowNeuronsPo } from "$tests/page-objects/EditFollowNeurons.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import { NnsStakeNeuronPo } from "$tests/page-objects/NnsStakeNeuron.page-object";
import { SetDissolveDelayPo } from "$tests/page-objects/SetDissolveDelay.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsStakeNeuronModalPo extends ModalPo {
  private static readonly TID = "nns-stake-neuron-modal-component";

  static under(element: PageObjectElement): NnsStakeNeuronModalPo | null {
    return new NnsStakeNeuronModalPo(
      element.byTestId(NnsStakeNeuronModalPo.TID)
    );
  }

  getNnsStakeNeuronPo(): NnsStakeNeuronPo {
    return NnsStakeNeuronPo.under(this.root);
  }

  getAddUserToHotkeysPo(): AddUserToHotkeysPo {
    return AddUserToHotkeysPo.under(this.root);
  }

  getSetDissolveDelayPo(): SetDissolveDelayPo {
    return SetDissolveDelayPo.under(this.root);
  }

  getConfirmDissolveDelayPo(): ConfirmDissolveDelayPo {
    return ConfirmDissolveDelayPo.under(this.root);
  }

  getEditFollowNeuronsPo(): EditFollowNeuronsPo {
    return EditFollowNeuronsPo.under(this.root);
  }

  async stake({
    amount,
    dissolveDelayDays = "max",
  }: {
    amount: number;
    dissolveDelayDays?: "max" | number;
  }): Promise<void> {
    await this.getNnsStakeNeuronPo().stake(amount);
    await this.getSetDissolveDelayPo().setDissolveDelayDays(dissolveDelayDays);
    if (dissolveDelayDays !== 0) {
      await this.getConfirmDissolveDelayPo().clickConfirm();
    }
    await this.getEditFollowNeuronsPo().waitFor();
    await this.closeModal();
  }
}
