import { NnsStakeNeuronModalPo } from "$tests/page-objects/NnsStakeNeuronModal.page-object";
import { PageBannerPo } from "$tests/page-objects/PageBanner.page-object";
import { ProjectsTablePo } from "$tests/page-objects/ProjectsTable.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { SnsStakeNeuronModalPo } from "$tests/page-objects/SnsStakeNeuronModal.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class StakingPo extends BasePageObject {
  private static readonly TID = "staking-component";

  static under(element: PageObjectElement): StakingPo {
    return new StakingPo(element.byTestId(StakingPo.TID));
  }

  getPageBannerPo(): PageBannerPo {
    return PageBannerPo.under({
      element: this.root,
      testId: "staking-page-banner",
    });
  }

  getSignInPo(): SignInPo {
    return SignInPo.under(this.root);
  }

  getProjectsTablePo(): ProjectsTablePo {
    return ProjectsTablePo.under(this.root);
  }

  getNnsStakeNeuronModalPo(): NnsStakeNeuronModalPo {
    return NnsStakeNeuronModalPo.under(this.root);
  }

  getSnsStakeNeuronModalPo(): SnsStakeNeuronModalPo {
    return SnsStakeNeuronModalPo.under(this.root);
  }

  async stakeFirstNnsNeuron({
    amount,
    dissolveDelayDays = "max",
  }: {
    amount: number;
    dissolveDelayDays?: "max" | number;
  }): Promise<void> {
    const nnsRow =
      await this.getProjectsTablePo().getRowByTitle("Internet Computer");
    await nnsRow.getStakeButtonPo().click();
    const modal = this.getNnsStakeNeuronModalPo();
    await modal.stake({ amount, dissolveDelayDays });
    // After staking the first neuron, we get redirected to the neurons page.
    await this.waitForAbsent();
  }

  async stakeFirstSnsNeuron({
    projectName,
    amount,
  }: {
    projectName: string;
    amount: number;
  }): Promise<void> {
    const snsRow = await this.getProjectsTablePo().getRowByTitle(projectName);
    await snsRow.getStakeButtonPo().click();
    const modal = this.getSnsStakeNeuronModalPo();
    await modal.stake(amount);
    // After staking the first neuron, we get redirected to the SNS neurons page.
    await this.waitForAbsent();
  }
}
