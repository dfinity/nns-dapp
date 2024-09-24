import { TogglePo } from "$tests/page-objects/Toggle.page-object";
import { TooltipIconPo } from "$tests/page-objects/TooltipIcon.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
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
    return this.root.querySelector("[slot='title']").getText();
  }

  getSubtitleText(): Promise<string> {
    return this.root.querySelector("[slot='subtitle']").getText();
  }

  getSubtitleLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root.querySelector("[slot='subtitle'] a"),
    });
  }

  getTogglePo(): TogglePo {
    return TogglePo.under(this.root.querySelector(".toggle-container"));
  }
}
