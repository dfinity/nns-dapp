import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UniverseLogoPo extends BasePageObject {
  private static readonly TID = "project-logo";

  static under(element: PageObjectElement): UniverseLogoPo {
    return new UniverseLogoPo(element.byTestId(UniverseLogoPo.TID));
  }

  getLogoAltText(): Promise<string> {
    return this.root.byTestId("logo").getAttribute("alt");
  }

  getLogoSource(): Promise<string> {
    return this.root.byTestId("logo").getAttribute("src");
  }
}
