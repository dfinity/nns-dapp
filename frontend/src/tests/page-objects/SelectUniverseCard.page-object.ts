import { CardPo } from "$tests/page-objects/Card.page-object";
import { UniverseAccountsBalancePo } from "$tests/page-objects/UniverseAccountsBalance.page-object";
import { UniverseLogoPo } from "$tests/page-objects/UniverseLogo.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectUniverseCardPo extends CardPo {
  private static readonly TID = "select-universe-card";

  static under(element: PageObjectElement): SelectUniverseCardPo {
    return new SelectUniverseCardPo(element.byTestId(SelectUniverseCardPo.TID));
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<SelectUniverseCardPo[]> {
    return Array.from(await element.allByTestId(SelectUniverseCardPo.TID)).map(
      (el) => new SelectUniverseCardPo(el)
    );
  }

  static countUnder({
    element,
    count,
  }: {
    element: PageObjectElement;
    count?: number | undefined;
  }): SelectUniverseCardPo[] {
    return element
      .countByTestId({
        tid: SelectUniverseCardPo.TID,
        count,
      })
      .map((el) => new SelectUniverseCardPo(el));
  }

  getUniverseAccountsBalancePo(): UniverseAccountsBalancePo {
    return UniverseAccountsBalancePo.under(this.root);
  }

  getUniverseLogoPo(): UniverseLogoPo {
    return UniverseLogoPo.under(this.root);
  }

  getName(): Promise<string> {
    return this.root.querySelector("span.name").getText();
  }

  getLogoAltText(): Promise<string> {
    return this.getUniverseLogoPo().getLogoAltText();
  }

  getLogoSource(): Promise<string> {
    return this.getUniverseLogoPo().getLogoSource();
  }

  getBalance(): Promise<string> {
    return this.getUniverseAccountsBalancePo().getBalance();
  }

  hasBalance(): Promise<boolean> {
    return this.getUniverseAccountsBalancePo().isPresent();
  }
}
