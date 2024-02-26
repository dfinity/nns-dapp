import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SelectCyclesCanisterPo extends BasePageObject {
  private static readonly TID = "select-cycles-screen";

  static under(element: PageObjectElement): SelectCyclesCanisterPo {
    return new SelectCyclesCanisterPo(
      element.byTestId(SelectCyclesCanisterPo.TID)
    );
  }

  enterIcpAmount(amount: string): Promise<void> {
    return this.getTextInput("select-cycles-icp-input").typeText(amount);
  }

  clickSubmit(): Promise<void> {
    return this.click("select-cycles-button");
  }
}
