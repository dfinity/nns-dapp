import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SelectUniverseCardPo } from "$tests/page-objects/SelectUniverseCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { nonNullish } from "@dfinity/utils";

export class SelectUniverseListPo extends BasePageObject {
  private static readonly TID = "select-universe-list-component";

  static under(element: PageObjectElement): SelectUniverseListPo {
    return new SelectUniverseListPo(element.byTestId(SelectUniverseListPo.TID));
  }

  getSelectUniverseCardPos({
    expectedCount,
  }: {
    expectedCount?: number | undefined;
  } = {}): Promise<SelectUniverseCardPo[]> {
    if (nonNullish(expectedCount)) {
      return SelectUniverseCardPo.countUnder({
        element: this.root,
        expectedCount,
      });
    }
    return SelectUniverseCardPo.allUnder(this.root);
  }

  async getSnsUniverseCards(): Promise<SelectUniverseCardPo[]> {
    const cards = await this.getSelectUniverseCardPos();
    const names = await Promise.all(cards.map((card) => card.getName()));
    const nonSnsNames = ["Internet Computer", "ckBTC", "ckTESTBTC"];
    const snsCards = [];
    for (let i = 0; i < names.length; i++) {
      if (!nonSnsNames.includes(names[i])) {
        snsCards.push(cards[i]);
      }
    }
    return snsCards;
  }
}
