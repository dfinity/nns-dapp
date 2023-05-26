import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

// The hotkey row does not have its own component so its PO doesn't not have its
// own file.
class HotkeyRowPo extends BasePageObject {
  static readonly TID = "hotkey-row";

  static async allUnder(element: PageObjectElement): Promise<HotkeyRowPo[]> {
    return Array.from(await element.allByTestId(HotkeyRowPo.TID)).map(
      (el) => new HotkeyRowPo(el)
    );
  }

  getPrincipal(): Promise<string> {
    return this.getText("hotkey-principal");
  }

  clickRemove(): Promise<void> {
    return this.click("remove-hotkey-button");
  }
}

export class SnsNeuronHotkeysCardPo extends BasePageObject {
  static readonly TID = "sns-neuron-hotkeys-card-component";

  static under(element: PageObjectElement): SnsNeuronHotkeysCardPo {
    return new SnsNeuronHotkeysCardPo(
      element.byTestId(SnsNeuronHotkeysCardPo.TID)
    );
  }

  getHotkeyRowPos(): Promise<HotkeyRowPo[]> {
    return HotkeyRowPo.allUnder(this.root);
  }

  async getHotkeyRowPo(principal: string): Promise<HotkeyRowPo> {
    const rows = await this.getHotkeyRowPos();
    // This awaits sequentially but the number of hotkeys is probably small.
    for (const row of rows) {
      if ((await row.getPrincipal()) === principal) {
        return row;
      }
    }
    throw new Error(`Hotkey not found: ${principal}`);
  }

  clickAddHotkey(): Promise<void> {
    return this.click("add-hotkey-button");
  }

  async removeHotkey(principal: string): Promise<void> {
    const row = await this.getHotkeyRowPo(principal);
    return row.clickRemove();
  }
}
