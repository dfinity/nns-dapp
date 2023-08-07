import type { PageObjectElement } from "$tests/types/page-object.types";
import { BasePageObject } from "./base.page-object";

export class ConfirmationModalPo extends BasePageObject {
  private static TID = "confirmation-modal-component";

  static under(element: PageObjectElement): ConfirmationModalPo {
    return new ConfirmationModalPo(element.byTestId(ConfirmationModalPo.TID));
  }

  async getContentText(): Promise<string> {
    return (
      await this.root.byTestId("confirmation-modal-content").getText()
    ).trim();
  }
}
