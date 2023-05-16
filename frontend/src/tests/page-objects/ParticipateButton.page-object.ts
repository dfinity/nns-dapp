import { ParticipateSwapModalPo } from "$tests/page-objects/ParticipateSwapModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ParticipateButtonPo extends BasePageObject {
  private static readonly TID = "participate-button-component";

  static under(element: PageObjectElement): ParticipateButtonPo {
    return new ParticipateButtonPo(element.byTestId(ParticipateButtonPo.TID));
  }

  getParticipateSwapModalPo(): ParticipateSwapModalPo {
    return ParticipateSwapModalPo.under(this.root);
  }

  async participate({ amount }: { amount: number }): Promise<void> {
    await this.getButton().click();
    const modal = this.getParticipateSwapModalPo();
    await modal.participate({ amount });
    await modal.waitForAbsent();
  }
}
