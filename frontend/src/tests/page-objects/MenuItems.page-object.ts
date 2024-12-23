import { ActionableProposalCountBadgePo } from "$tests/page-objects/ActionableProposalCountBadge.page-object";
import { GetTokensPo } from "$tests/page-objects/GetTokens.page-object";
import { LinkPo } from "$tests/page-objects/Link.page-object";
import { NnsNeuronsMissingRewardsBadgePo } from "$tests/page-objects/NnsNeuronsMissingRewardsBadge.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class MenuItemsPo extends BasePageObject {
  private static readonly TID = "menu-items-component";

  static under(element: PageObjectElement): MenuItemsPo {
    return new MenuItemsPo(element.byTestId(MenuItemsPo.TID));
  }

  getProposalsActionableCountBadgePo(): ActionableProposalCountBadgePo {
    return ActionableProposalCountBadgePo.under(this.root);
  }

  getNnsNeuronsMissingRewardsBadgePo(): NnsNeuronsMissingRewardsBadgePo {
    return NnsNeuronsMissingRewardsBadgePo.under(this.root);
  }

  clickAccounts(): Promise<void> {
    return this.click("menuitem-accounts");
  }

  clickNeuronStaking(): Promise<void> {
    return this.click("menuitem-neurons");
  }

  clickProposals(): Promise<void> {
    return this.click("menuitem-proposals");
  }

  clickLaunchpad(): Promise<void> {
    return this.click("menuitem-launchpad");
  }

  getSourceCodeButtonPo(): LinkPo {
    return LinkPo.under({ element: this.root, testId: "source-code-link" });
  }

  getTotalValueLockedLinkPo(): LinkPo {
    return LinkPo.under({
      element: this.root,
      testId: "total-value-locked-component",
    });
  }

  getGetTokensPo(): GetTokensPo {
    return GetTokensPo.under(this.root);
  }

  getPortfolioLinkPo(): LinkPo {
    return LinkPo.under({ element: this.root, testId: "menuitem-portfolio" });
  }

  hasFooter(): Promise<boolean> {
    return this.isPresent("menu-footer");
  }
}
