import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { ButtonPo } from "./Button.page-object";
import { LinkPo } from "./Link.page-object";

export class NnsNeuronPublicVisibilityActionPo extends BasePageObject {
  private static readonly TID = "nns-neuron-public-visibility-action-component";

  static under(element: PageObjectElement): NnsNeuronPublicVisibilityActionPo {
    return new NnsNeuronPublicVisibilityActionPo(
      element.byTestId("nns-neuron-public-visibility-action-component")
    );
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
  }

  getTitleText(): Promise<string> {
    return this.getText("neuron-visibility-title");
  }

  getSubtitleText(): Promise<string> {
    return this.getText("neuron-visibility-description");
  }

  getSubtitleLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "neuron-visibility-learn-more",
    });
  }

  getButtonPo(): ButtonPo {
    return ButtonPo.under({
      element: this.root,
      testId: "change-neuron-visibility-button",
    });
  }
}
