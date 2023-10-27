import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class RangeDissolveDelayPo extends BasePageObject {
  private static readonly TID = "range-dissolve-delay-component";

  static under(element: PageObjectElement): RangeDissolveDelayPo {
    return new RangeDissolveDelayPo(element.byTestId(RangeDissolveDelayPo.TID));
  }

  async getProgressBarSeconds(): Promise<number> {
    return Number(
      await this.root.querySelector("progress").getAttribute("value")
    );
  }
}
