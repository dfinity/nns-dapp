import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { BannerPo } from "$tests/page-objects/Banner.page-object";

export class LedgerNeuronHotkeyWarningPo extends BasePageObject {
  private static readonly TID = "ledger-neuron-hotkey-warning-component";

  static under(element: PageObjectElement): LedgerNeuronHotkeyWarningPo {
    return new LedgerNeuronHotkeyWarningPo(
      element.byTestId(LedgerNeuronHotkeyWarningPo.TID)
    );
  }

  getBannerPo(): BannerPo {
    return BannerPo.under(this.root);
  }

  async isBannerVisible(): Promise<boolean> {
    return this.getBannerPo().isPresent();
  }
}
