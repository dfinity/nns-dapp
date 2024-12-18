import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { TooltipIconPo } from "./TooltipIcon.page-object";

export class HeadingSubtitleWithUsdValuePo extends BasePageObject {
  private static readonly TID = "heading-subtitle-with-usd-value-component";

  static under(element: PageObjectElement): HeadingSubtitleWithUsdValuePo {
    return new HeadingSubtitleWithUsdValuePo(
      element.byTestId(HeadingSubtitleWithUsdValuePo.TID)
    );
  }

  getTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(this.root);
  }

  hasAmountInUsd(): Promise<boolean> {
    return this.isPresent("usd-value");
  }

  getAmountInUsd(): Promise<string> {
    return this.getText("usd-value");
  }
}
