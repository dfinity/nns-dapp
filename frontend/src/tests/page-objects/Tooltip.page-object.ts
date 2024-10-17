import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { assertNonNullish } from "$tests/utils/utils.test-utils";

export class TooltipPo extends BasePageObject {
  private static readonly TOOLTIP_TID = "tooltip-component";

  static under(element: PageObjectElement): TooltipPo {
    return new TooltipPo(element.byTestId(TooltipPo.TOOLTIP_TID));
  }

  async getTooltipText(): Promise<string> {
    return assertNonNullish(await this.getTooltipElement()).getText();
  }

  getAriaDescribedBy(): Promise<string> {
    return this.root
      .querySelector(".tooltip-target")
      .getAttribute("aria-describedby");
  }

  async getTooltipId(): Promise<string> {
    return (await this.getTooltipElement()).getAttribute("id");
  }

  async isTooltipEnabled(): Promise<boolean> {
    return !(await (await this.getTooltipElement()).getClasses()).includes(
      "not-rendered"
    );
  }

  async getTooltipElement(): Promise<PageObjectElement> {
    const id = await this.getAriaDescribedBy();
    const body = await this.root.getDocumentBody();
    const tooltipElements = await body.querySelectorAll(`#${CSS.escape(id)}`);
    if (tooltipElements.length !== 1) {
      throw new Error(
        `Found ${tooltipElements.length} tooltip elements with id ${id}`
      );
    }
    return tooltipElements[0];
  }

  async getDisplayedText(): Promise<string> {
    return this.root.querySelector(".tooltip-target").getText();
  }
}
