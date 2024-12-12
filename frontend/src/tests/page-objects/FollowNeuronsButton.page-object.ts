import { ButtonPo } from "$tests/page-objects/Button.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class FollowNeuronsButtonPo extends ButtonPo {
  private static readonly TID = "follow-neurons-button-component";

  static under({
    element,
  }: {
    element: PageObjectElement;
  }): FollowNeuronsButtonPo {
    return new FollowNeuronsButtonPo(
      element.byTestId(FollowNeuronsButtonPo.TID)
    );
  }
}
