import { AddPrincipalPo } from "$tests/page-objects/AddPrincipal.page-object";
import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddHotkeyModalPo extends ModalPo {
  private static readonly TID = "add-hotkey-neuron-modal";

  static under(element: PageObjectElement): AddHotkeyModalPo {
    return new AddHotkeyModalPo(element.byTestId(AddHotkeyModalPo.TID));
  }

  getAddPrincipalPo(): AddPrincipalPo {
    return AddPrincipalPo.under(this.root);
  }

  async addHotkey(principal: string): Promise<void> {
    await this.getAddPrincipalPo().addPrincipal(principal);
    await this.waitForClosed();
  }
}
