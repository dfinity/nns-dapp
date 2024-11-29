import type { PageObjectElement } from "$tests/types/page-object.types";
import { BannerPo } from "./Banner.page-object";
import { BasePageObject } from "./base.page-object";

export class LosingRewardsBannerPo extends BasePageObject {
  private static readonly TID = "losing-rewards-banner-component";

  static under(element: PageObjectElement): LosingRewardsBannerPo {
    return new LosingRewardsBannerPo(
      element.byTestId(LosingRewardsBannerPo.TID)
    );
  }

  getBannerPo(): BannerPo {
    return BannerPo.under(this.root);
  }

  async isVisible(): Promise<boolean> {
    return this.getBannerPo().isPresent();
  }

  async getTitle(): Promise<string> {
    return this.getBannerPo().getTitle();
  }

  async getText(): Promise<string> {
    return this.getBannerPo().getText();
  }

  async clickConfirm(): Promise<void> {
    // TBD
  }
}
