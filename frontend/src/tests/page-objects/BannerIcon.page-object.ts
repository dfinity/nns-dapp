import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class BannerIconPo extends BasePageObject {
  private static readonly TID = "banner-icon-component";

  static under(element: PageObjectElement): BannerIconPo {
    return new BannerIconPo(element.byTestId(BannerIconPo.TID));
  }

  async isStatusError(): Promise<boolean> {
    return (await this.root.getClasses()).includes("error");
  }

  async isStatusSuccess(): Promise<boolean> {
    return (await this.root.getClasses()).includes("success");
  }
}
