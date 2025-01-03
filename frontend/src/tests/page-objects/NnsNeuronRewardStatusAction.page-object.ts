import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ConfirmFollowingButtonPo } from "./ConfirmFollowingButton.page-object";
import { FollowNeuronsButtonPo } from "./FollowNeuronsButton.page-object";

export class NnsNeuronRewardStatusActionPo extends BasePageObject {
  private static readonly TID = "nns-neuron-reward-status-action-component";

  static under(element: PageObjectElement): NnsNeuronRewardStatusActionPo {
    return new NnsNeuronRewardStatusActionPo(
      element.byTestId(NnsNeuronRewardStatusActionPo.TID)
    );
  }

  getTitle(): Promise<string> {
    return this.getText("state-title");
  }

  getDescription(): Promise<string> {
    return this.getText("state-description");
  }

  getConfirmFollowingButtonPo(): ConfirmFollowingButtonPo {
    return ConfirmFollowingButtonPo.under(this.root);
  }

  getFollowNeuronsButtonPo(): FollowNeuronsButtonPo {
    return FollowNeuronsButtonPo.under({
      element: this.root,
    });
  }
}
