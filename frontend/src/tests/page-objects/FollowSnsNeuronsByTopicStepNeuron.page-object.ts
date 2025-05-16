import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

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

  getNeuronIdInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
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
