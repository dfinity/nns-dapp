import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NewSnsFolloweeModalPo extends ModalPo {
  private static readonly TID = "new-sns-followee-modal-component";

  static under(element: PageObjectElement): NewSnsFolloweeModalPo {
    return new NewSnsFolloweeModalPo(
      element.byTestId(NewSnsFolloweeModalPo.TID)
    );
  }
}
