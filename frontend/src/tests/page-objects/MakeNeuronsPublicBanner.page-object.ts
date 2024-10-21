import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import type { ButtonPo } from "./Button.page-object";
import { LinkPo } from "./Link.page-object";
import { MakeNeuronsPublicModalPo } from "./MakeNeuronsPublicModal.page-object";

export class MakeNeuronsPublicBannerPo extends BasePageObject {
  private static readonly TID = "make-neurons-public-banner-component";

  static under(element: PageObjectElement): MakeNeuronsPublicBannerPo {
    return new MakeNeuronsPublicBannerPo(
      element.byTestId(MakeNeuronsPublicBannerPo.TID)
    );
  }

  getTitleText(): Promise<string> {
    return this.getText("banner-title");
  }

  getSubtitleText(): Promise<string> {
    return this.getText("banner-description");
  }

  getSubtitleLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "banner-description-link",
    });
  }

  getCloseButtonPo(): ButtonPo {
    return this.getButton("close-button");
  }

  getBannerChangeNeuronVisibilityButtonPo(): ButtonPo {
    return this.getButton("banner-change-neuron-visibility-button");
  }

  getMakeNeuronsPublicModalPo(): MakeNeuronsPublicModalPo {
    return MakeNeuronsPublicModalPo.under(this.root);
  }
}
