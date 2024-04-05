import { HashPo } from "$tests/page-objects/Hash.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class IdentifierHashPo extends HashPo {
  static under(element: PageObjectElement): IdentifierHashPo {
    return new IdentifierHashPo(element.byTestId(HashPo.TID));
  }

  getDisplayedText(): Promise<string> {
    return this.getText("identifier");
  }
}
