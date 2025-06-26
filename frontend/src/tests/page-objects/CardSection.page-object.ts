import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CardSectionPo extends BasePageObject {
  static readonly TID = "card-section-component";

  static under(element: PageObjectElement): CardSectionPo {
    return new CardSectionPo(element.byTestId(CardSectionPo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<CardSectionPo[]> {
    return Array.from(await element.allByTestId(CardSectionPo.TID)).map(
      (el) => new CardSectionPo(el)
    );
  }

  getTitle(): Promise<string> {
    return this.getText("title");
  }

  async getCardCount(): Promise<number> {
    return (await this.root.querySelectorAll("[data-tid='card-entry']"))
      ?.length;
  }
}
