import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class HashPo extends BasePageObject {
  static readonly TID = "hash-component";

  static under(element: PageObjectElement): HashPo {
    return new HashPo(element.byTestId(HashPo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<HashPo[]> {
    return Array.from(await element.allByTestId(HashPo.TID)).map(
      (el) => new HashPo(el)
    );
  }
  getTooltipPo(): TooltipPo {
    return TooltipPo.under(this.root);
  }

  getCopyButtonPo(): ButtonPo {
    return this.getButton("copy-component");
  }

  getDisplayedText(): Promise<string> {
    return this.getTooltipPo().getDisplayedText();
  }

  getFullText(): Promise<string> {
    return this.getTooltipPo().getTooltipText();
  }

  hasCopyButton(): Promise<boolean> {
    return this.getCopyButtonPo().isPresent();
  }

  copy(): Promise<void> {
    return this.getCopyButtonPo().click();
  }
}
