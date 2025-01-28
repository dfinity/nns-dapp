import { HashPo } from "$tests/page-objects/Hash.page-object";
import { TagPo } from "$tests/page-objects/Tag.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsFolloweePo extends BasePageObject {
  private static readonly TID = "sns-followee-component";

  static under(element: PageObjectElement): SnsFolloweePo {
    return new SnsFolloweePo(element.byTestId(SnsFolloweePo.TID));
  }

  static async allUnder(element: PageObjectElement): Promise<SnsFolloweePo[]> {
    return Array.from(await element.allByTestId(SnsFolloweePo.TID)).map(
      (el) => new SnsFolloweePo(el)
    );
  }

  getHashPo(): HashPo {
    return HashPo.under(this.root);
  }

  getTagPos(): Promise<TagPo[]> {
    return TagPo.allUnder(this.root);
  }
}
