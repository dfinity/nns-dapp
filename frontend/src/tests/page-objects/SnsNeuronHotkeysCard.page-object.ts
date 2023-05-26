import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronHotkeysCardPo extends BasePageObject {
  static readonly TID = "sns-neuron-hotkeys-card-component";

  static under(element: PageObjectElement): SnsNeuronHotkeysCardPo {
    return new SnsNeuronHotkeysCardPo(
      element.byTestId(SnsNeuronHotkeysCardPo.TID)
    );
  }

  clickAddHotkey(): Promise<void> {
    return this.click("add-hotkey-button");
  }
}
