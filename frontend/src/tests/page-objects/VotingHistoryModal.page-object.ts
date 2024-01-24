import { ModalPo } from "$tests/page-objects/Modal.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class VotingHistoryModalPo extends ModalPo {
  private static readonly TID = "voting-history-modal";

  static under(element: PageObjectElement): VotingHistoryModalPo {
    return new VotingHistoryModalPo(element.byTestId(VotingHistoryModalPo.TID));
  }
}
