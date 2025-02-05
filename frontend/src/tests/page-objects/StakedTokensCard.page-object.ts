import { MaturityWithTooltipPo } from "$tests/page-objects/MaturityWithTooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { nonNullish } from "@dfinity/utils";

class StakedTokensCardRowPo extends BasePageObject {
  private static readonly TID = "staked-tokens-card-row";

  static async allUnder(
    element: PageObjectElement
  ): Promise<StakedTokensCardRowPo[]> {
    const rows = await element.allByTestId(StakedTokensCardRowPo.TID);
    return rows.map((el) => new StakedTokensCardRowPo(el));
  }

  getRowTag(): Promise<string> {
    return this.root.getTagName();
  }

  getRowHref(): Promise<string> {
    return this.root.getAttribute("href");
  }

  getStakedTokenTitle(): Promise<string> {
    return this.getText("title");
  }

  async getStakedTokenMaturity(): Promise<string> {
    const maturityWithTooltipPo = MaturityWithTooltipPo.under(this.root);
    const totalMaturity = await maturityWithTooltipPo.getTotalMaturity();

    if (nonNullish(totalMaturity)) return totalMaturity;
    return this.getText("maturity");
  }

  getStakedTokenStakeInUsd(): Promise<string> {
    return this.getText("stake-in-usd");
  }

  getStakedTokenStakeInNativeCurrency(): Promise<string> {
    return this.getText("stake-in-native");
  }
}

export class StakedTokensCardPo extends BasePageObject {
  private static readonly TID = "staked-tokens-card";

  static under(element: PageObjectElement): StakedTokensCardPo {
    return new StakedTokensCardPo(element.byTestId(StakedTokensCardPo.TID));
  }

  async getRows(): Promise<StakedTokensCardRowPo[]> {
    return StakedTokensCardRowPo.allUnder(this.root);
  }

  getAmount(): Promise<string> {
    return this.getText("amount");
  }

  getInfoRow(): PageObjectElement {
    return this.getElement("info-row");
  }

  async getStakedTokensTitle(): Promise<string[]> {
    const rowsPos = await this.getRows();
    return Promise.all(rowsPos.map((po) => po.getStakedTokenTitle()));
  }

  async getStakedTokensMaturity(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getStakedTokenMaturity()));
  }

  async getStakedTokensStakeInUsd(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getStakedTokenStakeInUsd()));
  }

  async getStakedTokensStakeInNativeCurrency(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(
      rows.map((row) => row.getStakedTokenStakeInNativeCurrency())
    );
  }

  async getRowsTags(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getRowTag()));
  }

  async getRowsHref(): Promise<string[]> {
    const rows = await this.getRows();
    return Promise.all(rows.map((row) => row.getRowHref()));
  }
}
