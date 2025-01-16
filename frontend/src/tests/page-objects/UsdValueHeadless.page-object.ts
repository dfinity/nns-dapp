import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class UsdValueHeadlessPo extends BasePageObject {
  private static readonly TID = "usd-value-headless-consumer";

  static under(element: PageObjectElement): UsdValueHeadlessPo {
    return new UsdValueHeadlessPo(element.byTestId(UsdValueHeadlessPo.TID));
  }

  getUsdAmountFormatted(): Promise<string> {
    return this.getText("usd-amount");
  }

  getIcpAmountFormatted(): Promise<string> {
    return this.getText("icp-amount");
  }

  getHasError(): Promise<string> {
    return this.getText("has-error");
  }

  getHasPricesAndUnpricedTokens(): Promise<string> {
    return this.getText("has-prices-ans-unpriced-tokens");
  }
}
