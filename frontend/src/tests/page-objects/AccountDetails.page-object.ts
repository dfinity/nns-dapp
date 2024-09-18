import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { IdentifierHashPo } from "./IdentifierHash.page-object";
import { TooltipIconPo } from "./TooltipIcon.page-object";

export class AccountDetailsPo extends BasePageObject {
  private static readonly TID = "account-details-component";

  static under(element: PageObjectElement): AccountDetailsPo {
    return new AccountDetailsPo(element.byTestId(AccountDetailsPo.TID));
  }

  private getMainIcpAccountIdPo(): IdentifierHashPo {
    return IdentifierHashPo.under(
      this.root.byTestId("main-icp-account-id-container")
    );
  }

  private getPrincipalIdPo(): IdentifierHashPo {
    return IdentifierHashPo.under(this.root.byTestId("principal-id-container"));
  }

  private getMainIcpAccountIdTooltipIconPo(): TooltipIconPo {
    return TooltipIconPo.under(
      this.root.byTestId("main-icp-account-id-container")
    );
  }

  async getMainIcpAccountIdTooltipId(): Promise<string> {
    const tooltipIconPo = this.getMainIcpAccountIdTooltipIconPo();
    return tooltipIconPo.getTooltipPo().getTooltipId();
  }

  async getMainIcpAccountId(): Promise<string> {
    return this.getMainIcpAccountIdPo().getFullText();
  }

  async getPrincipalId(): Promise<string> {
    return this.getPrincipalIdPo().getFullText();
  }

  async getMainIcpAccountIdTooltipText(): Promise<string> {
    const tooltipIconPo = this.getMainIcpAccountIdTooltipIconPo();
    return tooltipIconPo.getTooltipText();
  }
}
