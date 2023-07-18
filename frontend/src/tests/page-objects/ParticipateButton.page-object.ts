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

  async participate(params: {
    amount: number;
    acceptConditions: boolean;
  }): Promise<void> {
    await this.getButton().click();
    const modal = this.getParticipateSwapModalPo();
    await modal.participate(params);
    // We wait for the modal to disappear. It has a timeout of 1 second to close itself.
    // Yet, it takes more than 2 seconds to finish all calls and tasks. So we wait for 3 seconds.
    await modal.waitForAbsent(3000);
  }
}
