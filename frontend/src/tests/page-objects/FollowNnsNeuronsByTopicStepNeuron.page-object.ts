import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { KnownNeuronFollowByTopicsItemPo } from "$tests/page-objects/KnownNeuronFollowByTopicsItem.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNnsNeuronsByTopicStepNeuronPo extends BasePageObject {
  private static readonly TID =
    "follow-nns-neurons-by-topic-step-neuron-component";

  static under(
    element: PageObjectElement
  ): FollowNnsNeuronsByTopicStepNeuronPo {
    return new FollowNnsNeuronsByTopicStepNeuronPo(
      element.byTestId(FollowNnsNeuronsByTopicStepNeuronPo.TID)
    );
  }

  getNeuronAddressInputPo(): InputWithErrorPo {
    return InputWithErrorPo.under({
      element: this.root,
      testId: "input-with-error-compoment",
    });
  }

  getNeuronAddressValue(): Promise<string> {
    return this.getNeuronAddressInputPo().getValue();
  }

  getBackButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "back-button",
    });
  }

  getFollowNeuronButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "follow-neuron-button",
    });
  }

  async getKnownNeuronItems(): Promise<KnownNeuronFollowByTopicsItemPo[]> {
    return KnownNeuronFollowByTopicsItemPo.allUnder(this.root);
  }

  getErrorMessagePo(): PageObjectElement {
    return this.root.byTestId("custom-error-message");
  }

  async getErrorMessage(): Promise<string | null> {
    return this.getErrorMessagePo().getText();
  }

  async hasErrorMessage(): Promise<boolean> {
    return this.getErrorMessagePo().isPresent();
  }

  clickFollowNeuronButton(): Promise<void> {
    return this.getFollowNeuronButtonPo().click();
  }

  clickBackButton(): Promise<void> {
    return this.getBackButtonPo().click();
  }

  async typeNeuronAddress(address: string): Promise<void> {
    const input = this.getNeuronAddressInputPo();
    await input.typeText(address);
  }

  async isFollowNeuronButtonDisabled(): Promise<boolean> {
    return this.getFollowNeuronButtonPo().isDisabled();
  }
}
