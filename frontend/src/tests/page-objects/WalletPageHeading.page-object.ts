import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { AmountDisplayPo } from "./AmountDisplay.page-object";
import { HashPo } from "./Hash.page-object";
import { HeadingSubtitleWithUsdValuePo } from "./HeadingSubtitleWithUsdValue.page-object";
import { TooltipPo } from "./Tooltip.page-object";
import { TooltipIconPo } from "./TooltipIcon.page-object";

export class WalletPageHeadingPo extends BasePageObject {
  private static readonly TID = "wallet-page-heading-component";

  static under(element: PageObjectElement): WalletPageHeadingPo {
    return new WalletPageHeadingPo(element.byTestId(WalletPageHeadingPo.TID));
  }

  getHeadingSubtitleWithUsdValuePo(): HeadingSubtitleWithUsdValuePo {
    return HeadingSubtitleWithUsdValuePo.under(this.root);
  }

  async getTitle(): Promise<string | null> {
    if (await this.hasBalancePlaceholder()) {
      return null;
    }
    return AmountDisplayPo.under(this.root).getText();
  }

  getTooltipText(): Promise<string> {
    return TooltipPo.under(this.root).getTooltipText();
  }

  hasBalancePlaceholder(): Promise<boolean> {
    return this.isPresent("balance-placeholder");
  }

  getSubtitle(): Promise<string> {
    return this.getText("wallet-page-heading-subtitle");
  }

  hasBalanceInUsd(): Promise<boolean> {
    return this.getHeadingSubtitleWithUsdValuePo().hasAmountInUsd();
  }

  getBalanceInUsd(): Promise<string> {
    return this.getHeadingSubtitleWithUsdValuePo().getAmountInUsd();
  }

  getTooltipIconPo(): TooltipIconPo {
    return this.getHeadingSubtitleWithUsdValuePo().getTooltipIconPo();
  }

  getPrincipal(): Promise<string> {
    return HashPo.under(
      this.root.byTestId("wallet-page-heading-principal")
    ).getFullText();
  }

  async hasImportedTokenTag(): Promise<boolean> {
    return this.isPresent("imported-token-tag");
  }
}
