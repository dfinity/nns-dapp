import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class InputRangePo extends BasePageObject {
  private static readonly TID = "input-range";

  static under(element: PageObjectElement): InputRangePo {
    return new InputRangePo(element.byTestId(InputRangePo.TID));
  }

  setValue(value: number): Promise<void> {
    return this.root.input(`${value}`);
  }

  async getValue(): Promise<number> {
    return Number(await this.root.getValue());
  }
}
