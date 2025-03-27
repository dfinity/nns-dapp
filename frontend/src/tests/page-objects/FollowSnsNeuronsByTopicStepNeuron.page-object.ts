import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";
import { ButtonPo } from "./Button.page-object";
import { TextInputPo } from "./TextInput.page-object";

export class FollowSnsNeuronsByTopicStepNeuronPo extends BasePageObject {
  private static readonly TID =
    "follow-sns-neurons-by-topic-step-neuron-component";

  static under(
    element: PageObjectElement
  ): FollowSnsNeuronsByTopicStepNeuronPo {
    return new FollowSnsNeuronsByTopicStepNeuronPo(
      element.byTestId(FollowSnsNeuronsByTopicStepNeuronPo.TID)
    );
  }

  getNeuronIdInputPo(): TextInputPo {
    return TextInputPo.under({
      element: this.root,
      testId: "new-followee-id",
    });
  }

  getNeuronIdValue(): Promise<string> {
    return this.getNeuronIdInputPo().getValue();
  }

  getBackButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "back-button",
    });
  }

  getConfirmButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "add-followee-button",
    });
  }

  clickConfirmButton(): Promise<void> {
    return this.getConfirmButtonPo().click();
  }

  clickBackButton(): Promise<void> {
    return this.getBackButtonPo().click();
  }
}
