import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ConfirmSnsDissolveDelayPo extends BasePageObject {
  private static readonly TID = "confirm-dissolve-delay-container";

  static under(element: PageObjectElement): ConfirmSnsDissolveDelayPo {
    return new ConfirmSnsDissolveDelayPo(
      element.byTestId(ConfirmSnsDissolveDelayPo.TID)
    );
  }

  getHashPo(): HashPo {
    return HashPo.under(this.root);
  }

  getEditButtonPo(): ButtonPo {
    return this.getButton("edit-delay-button");
  }

  getConfirmButtonPo(): ButtonPo {
    return this.getButton("confirm-delay-button");
  }

  getNeuronId(): Promise<string> {
    return this.getHashPo().getFullText();
  }

  getDissolveDelay(): Promise<string> {
    return this.getText("dissolve-delay");
  }

  getNeuronStake(): Promise<string> {
    return this.getText("neuron-stake");
  }

  getVotingPower(): Promise<string> {
    return this.getText("voting-power");
  }
}
