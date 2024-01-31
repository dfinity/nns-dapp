import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class AddSnsHotkeyModalPo extends ModalPo {
  private static readonly TID = "add-hotkey-neuron-modal";

  static under(element: PageObjectElement): AddSnsHotkeyModalPo {
    return new AddSnsHotkeyModalPo(element.byTestId(AddSnsHotkeyModalPo.TID));
  }

  async addHotkey(principal: string): Promise<void> {
    await this.getTextInput().typeText(principal);
    await this.click("add-principal-button");
  }
}
