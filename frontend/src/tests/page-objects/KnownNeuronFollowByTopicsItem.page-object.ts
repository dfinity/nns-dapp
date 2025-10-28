import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class KnownNeuronFollowByTopicsItemPo extends BasePageObject {
  private static readonly TID = "known-neuron-item-component";

  static under(element: PageObjectElement): KnownNeuronFollowByTopicsItemPo {
    return new KnownNeuronFollowByTopicsItemPo(
      element.byTestId(KnownNeuronFollowByTopicsItemPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<KnownNeuronFollowByTopicsItemPo[]> {
    return (await element.allByTestId(KnownNeuronFollowByTopicsItemPo.TID)).map(
      (element) => new KnownNeuronFollowByTopicsItemPo(element)
    );
  }

  getFollowButtonPo(): ButtonPo {
    return ButtonPo.under({ element: this.root });
  }

  async getNeuronName(): Promise<string> {
    const valueElement = await this.root.querySelector(".value");
    return valueElement?.getText() ?? "";
  }

  async isFollowButtonDisabled(): Promise<boolean> {
    return this.getFollowButtonPo().isDisabled();
  }

  clickFollowButton(): Promise<void> {
    return this.getFollowButtonPo().click();
  }

  async hasTooltip(): Promise<boolean> {
    const tooltipElement = await this.root.querySelector(
      '[id="desabled-known-neuron-follow-tooltip"]'
    );
    return tooltipElement !== null;
  }
}
