import { ConfirmationModalPo } from "$tests/page-objects/ConfirmationModal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class JoinCommunityFundModalPo extends ConfirmationModalPo {
  private static TID = "join-community-fund-modal-component";

  static under(element: PageObjectElement): JoinCommunityFundModalPo {
    return new JoinCommunityFundModalPo(
      element.byTestId(JoinCommunityFundModalPo.TID)
    );
  }
}
