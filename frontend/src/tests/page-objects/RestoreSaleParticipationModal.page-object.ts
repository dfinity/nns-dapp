import { ConfirmationModalPo } from "$tests/page-objects/ConfirmationModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class RestoreSaleParticipationModalPo extends ConfirmationModalPo {
  private static readonly TID = "restore-sale-participation-modal";

  static under(element: PageObjectElement): RestoreSaleParticipationModalPo {
    return new RestoreSaleParticipationModalPo(
      element.byTestId(RestoreSaleParticipationModalPo.TID)
    );
  }

  async getDescription(): Promise<string> {
    return (
      await this.getText("restore-sale-participation-description")
    ).trim();
  }
}
