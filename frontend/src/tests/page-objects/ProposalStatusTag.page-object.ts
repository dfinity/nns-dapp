import type { UniversalProposalStatus } from "$lib/types/proposals";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ProposalStatusTagPo extends BasePageObject {
  private static readonly TID = "proposal-status-tag";

  static under(element: PageObjectElement): ProposalStatusTagPo {
    return new ProposalStatusTagPo(element.byTestId(ProposalStatusTagPo.TID));
  }

  async hasStatusClass(className: UniversalProposalStatus): Promise<boolean> {
    const classNames = await this.root.getClasses();
    return classNames.includes(className);
  }
}
