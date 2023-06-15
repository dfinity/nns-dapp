import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class EditFollowNeuronsPo extends BasePageObject {
  private static readonly TID = "edit-followers-screen";

  static under(element: PageObjectElement): EditFollowNeuronsPo {
    return new EditFollowNeuronsPo(element.byTestId(EditFollowNeuronsPo.TID));
  }
}
