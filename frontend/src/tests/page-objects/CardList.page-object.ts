import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CardListPo extends BasePageObject {
  static readonly TID = "card-list-component";

  static under({
    element,
    testId = CardListPo.TID,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): CardListPo {
    return new CardListPo(element.byTestId(testId));
  }

  static async allUnder(element: PageObjectElement): Promise<CardListPo[]> {
    return Array.from(await element.allByTestId(CardListPo.TID)).map(
      (el) => new CardListPo(el)
    );
  }

  getCardEntries(): Promise<CardListEntryPo[]> {
    return CardListEntryPo.allUnder(this.root);
  }
}

export class CardListEntryPo extends BasePageObject {
  private static readonly TID = "card-entry";

  static under(element: PageObjectElement): CardListEntryPo {
    return new CardListEntryPo(element.byTestId(CardListEntryPo.TID));
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<CardListEntryPo[]> {
    return Array.from(await element.allByTestId(CardListEntryPo.TID)).map(
      (el) => new CardListEntryPo(el)
    );
  }
}
