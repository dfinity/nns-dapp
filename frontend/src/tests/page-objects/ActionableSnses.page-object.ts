import { ActionableSnsProposalsPo } from "$tests/page-objects/ActionableSnsProposals.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ActionableSnsesPo extends BasePageObject {
  private static readonly TID = "actionable-snses-component";

  static under(element: PageObjectElement): ActionableSnsesPo {
    return new ActionableSnsesPo(element.byTestId(ActionableSnsesPo.TID));
  }

  getActionableSnsProposalsPos(): Promise<ActionableSnsProposalsPo[]> {
    return ActionableSnsProposalsPo.allUnder(this.root);
  }
}
