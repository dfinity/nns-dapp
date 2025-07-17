import { BasePageObject } from "$tests/page-objects/base.page-object";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FavProjectButtonPo extends BasePageObject {
  private static readonly TID = "fav-project-button-component";

  static under(element: PageObjectElement): FavProjectButtonPo {
    return new FavProjectButtonPo(element.byTestId(FavProjectButtonPo.TID));
  }

  getButtonPo(): ButtonPo {
    return ButtonPo.under({ element: this.root });
  }

  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  async isVisible(): Promise<boolean> {
    return this.getButtonPo().isPresent();
  }

  async click(): Promise<void> {
    await this.getButtonPo().click();
  }
}
