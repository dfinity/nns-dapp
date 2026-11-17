import { LinkPo } from "$tests/page-objects/Link.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsNeuronHotkeysCardPo extends BasePageObject {
  private static readonly TID = "nns-neuron-hotkeys-card-component";

  static under(element: PageObjectElement): NnsNeuronHotkeysCardPo {
    return new NnsNeuronHotkeysCardPo(
      element.byTestId(NnsNeuronHotkeysCardPo.TID)
    );
  }

  clickAddHotkey(): Promise<void> {
    return this.click("add-hotkey-button");
  }

  getManageAllHotkeysLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "manage-all-hotkeys-link",
    });
  }
}
