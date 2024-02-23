import { CardPo } from "$tests/page-objects/Card.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class CanisterCardPo extends CardPo {
  private static readonly TID = "canister-card";

  static async allUnder(element: PageObjectElement): Promise<CanisterCardPo[]> {
    return Array.from(await element.allByTestId(CanisterCardPo.TID)).map(
      (el) => new CanisterCardPo(el)
    );
  }

  static under(element: PageObjectElement): CanisterCardPo {
    return new CanisterCardPo(element.byTestId(CanisterCardPo.TID));
  }

  async getCanisterName(): Promise<string> {
    return (await this.getText("canister-card-title-component")).trim();
  }
}
