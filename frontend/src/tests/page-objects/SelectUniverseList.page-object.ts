import { BasePageObject } from "$tests/page-objects/base.page-object";
import { SelectUniverseCardPo } from "$tests/page-objects/SelectUniverseCard.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectUniverseListPo extends BasePageObject {
  private static readonly TID = "select-universe-list-component";
  private static readonly NON_SNS_NAMES = [
    "Internet Computer",
    "ckBTC",
    "ckTESTBTC",
  ];

  static under(element: PageObjectElement): SelectUniverseListPo {
    return new SelectUniverseListPo(element.byTestId(SelectUniverseListPo.TID));
  }

  getSelectUniverseCardPos(): Promise<SelectUniverseCardPo[]> {
    return SelectUniverseCardPo.allUnder(this.root);
  }

  isSnsName(name: string): boolean {
    return !SelectUniverseListPo.NON_SNS_NAMES.includes(name);
  }

  async waitForSnsUniverseCards(): Promise<void> {
    const maybeCards = SelectUniverseCardPo.countUnder({
      element: this.root,
      count: SelectUniverseListPo.NON_SNS_NAMES.length + 1,
    });
    for (const card of maybeCards) {
      if (this.isSnsName(await card.getName())) {
        return;
      }
    }
    throw new Error("SNS universe cards not found");
  }

  async getSnsUniverseCards(): Promise<SelectUniverseCardPo[]> {
    // First make sure SNS projects are loaded.
    await this.waitForSnsUniverseCards();
    const cards = await this.getSelectUniverseCardPos();
    const names = await Promise.all(cards.map((card) => card.getName()));
    const snsCards = [];
    for (let i = 0; i < names.length; i++) {
      if (this.isSnsName(names[i])) {
        snsCards.push(cards[i]);
      }
    }
    return snsCards;
  }
}
