import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ApyDisplayPo extends BasePageObject {
  private static readonly TID = "apy-display-component";

  static under(element: PageObjectElement): ApyDisplayPo {
    return new ApyDisplayPo(element.byTestId(ApyDisplayPo.TID));
  }

  getCurrentApy(): PageObjectElement {
    return this.root.byTestId("apy-current-value");
  }

  getMaxApy(): PageObjectElement {
    return this.root.byTestId("apy-max-value");
  }

  async isLoading(): Promise<boolean> {
    return this.root.byTestId("is-loading").isPresent();
  }

  async displaysPlaceholder(): Promise<boolean> {
    return this.root.byTestId("placeholder").isPresent();
  }

  async isForPortfolio(): Promise<boolean> {
    return (await this.root.getClasses()).includes("forPortfolio");
  }
}
