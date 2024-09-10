import { AccountMenuPo } from "$tests/page-objects/AccountMenu.page-object";
import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { BackdropPo } from "$tests/page-objects/Backdrop.page-object";
import { BusyScreenPo } from "$tests/page-objects/BusyScreen.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { CanisterDetailPo } from "$tests/page-objects/CanisterDetail.page-object";
import { CanistersPo } from "$tests/page-objects/Canisters.page-object";
import { LaunchpadPo } from "$tests/page-objects/Launchpad.page-object";
import { MenuItemsPo } from "$tests/page-objects/MenuItems.page-object";
import { NeuronDetailPo } from "$tests/page-objects/NeuronDetail.page-object";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
import { ProjectDetailPo } from "$tests/page-objects/ProjectDetail.page-object";
import { ProposalDetailPo } from "$tests/page-objects/ProposalDetail.page-object";
import { ProposalsPo } from "$tests/page-objects/Proposals.page-object";
import { SelectUniverseListPo } from "$tests/page-objects/SelectUniverseList.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { StakingPo } from "$tests/page-objects/Staking.page-object";
import { WalletPo } from "$tests/page-objects/Wallet.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import { isNullish } from "@dfinity/utils";
import { expect } from "@playwright/test";
import { SignInAccountsPo } from "./SignInAccounts.page-object";
import { TokensRoutePo } from "./TokensRoute.page-object";

export class AppPo extends BasePageObject {
  getSignInPo(): SignInPo {
    return SignInPo.under(this.root);
  }

  getAccountMenuPo(): AccountMenuPo {
    return AccountMenuPo.under(this.root);
  }

  getAccountsPo(): AccountsPo {
    return AccountsPo.under(this.root);
  }

  getSignInAccountsPo(): SignInAccountsPo {
    return SignInAccountsPo.under(this.root);
  }

  getTokensPo(): TokensRoutePo {
    return TokensRoutePo.under(this.root);
  }

  getWalletPo(): WalletPo {
    return WalletPo.under(this.root);
  }

  getStakingPo(): StakingPo {
    return StakingPo.under(this.root);
  }

  getNeuronsPo(): NeuronsPo {
    return NeuronsPo.under(this.root);
  }

  getNeuronDetailPo(): NeuronDetailPo {
    return NeuronDetailPo.under(this.root);
  }

  getProposalsPo(): ProposalsPo {
    return ProposalsPo.under(this.root);
  }

  getProposalDetailPo(): ProposalDetailPo {
    return ProposalDetailPo.under(this.root);
  }

  getLaunchpadPo(): LaunchpadPo {
    return LaunchpadPo.under(this.root);
  }

  getProjectDetailPo(): ProjectDetailPo {
    return ProjectDetailPo.under(this.root);
  }

  getCanistersPo(): CanistersPo {
    return CanistersPo.under(this.root);
  }

  getCanisterDetailPo(): CanisterDetailPo {
    return CanisterDetailPo.under(this.root);
  }

  getMenuItemsPo(): MenuItemsPo {
    return MenuItemsPo.under(this.root);
  }

  getSelectUniverseListPo(): SelectUniverseListPo {
    return SelectUniverseListPo.under(this.root);
  }

  // Note that the universe selector and the main content have separate
  // backdrops. We just get the first one because we only use it to know if the
  // menu is open.
  getBackdropPo(): BackdropPo {
    return BackdropPo.under(this.root);
  }

  getMenuTogglePo(): ButtonPo {
    return this.getButton("menu-toggle");
  }

  getBusyScreenPo(): BusyScreenPo {
    return BusyScreenPo.under(this.root);
  }

  toggleMenu(): Promise<void> {
    return this.getMenuTogglePo().click();
  }

  async openMenu(): Promise<void> {
    await this.toggleMenu();
    await this.getBackdropPo().waitFor();
  }

  async closeMenu(): Promise<void> {
    await this.toggleMenu();
    await this.getBackdropPo().waitForAbsent();
  }

  // GIX-2080: Rename to "goToTokens"
  async goToAccounts(): Promise<void> {
    await this.goBackAllTheWay();
    await this.openMenu();
    await this.getMenuItemsPo().clickAccounts();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async goToNnsMainAccountWallet(): Promise<void> {
    await this.goToAccounts();
    await (
      await this.getTokensPo()
        .getTokensPagePo()
        .getTokensTable()
        .getRowByName("Internet Computer")
    ).click();
    await (
      await this.getAccountsPo()
        .getNnsAccountsPo()
        .getTokensTablePo()
        .getRowByName("Main")
    ).click();
  }

  async goToStaking(): Promise<void> {
    await this.goBackAllTheWay();
    await this.openMenu();
    await this.getMenuItemsPo().clickNeuronStaking();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
    await this.getStakingPo().waitFor();
  }

  async goToNnsNeurons(): Promise<void> {
    await this.goToStaking();
    const nnsRow = await this.getStakingPo()
      .getProjectsTablePo()
      .getRowByTitle("Internet Computer");
    await nnsRow.click();
    if (await nnsRow.getStakeButtonPo().isPresent()) {
      throw new Error(
        "Cannot navigate to NNS neurons because a neuron first needs to be staked."
      );
    }
    await this.getNeuronsPo().waitForContentLoaded();
  }

  async goToNeuronDetails(neuronId: string): Promise<void> {
    await this.goToNnsNeurons();
    await (
      await this.getNeuronsPo()
        .getNnsNeuronsPo()
        .getNeuronsTablePo()
        .getNeuronsTableRowPo(neuronId)
    ).click();
    await this.getNeuronDetailPo().waitFor();
  }

  async goToProposals(): Promise<void> {
    await this.goBackAllTheWay();
    await this.openMenu();
    await this.getMenuItemsPo().clickProposals();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async goToLaunchpad(): Promise<void> {
    await this.goBackAllTheWay();
    await this.openMenu();
    await this.getMenuItemsPo().clickLaunchpad();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async goToCanisters(): Promise<void> {
    await this.goBackAllTheWay();
    await this.getAccountMenuPo().openMenu();
    await this.getAccountMenuPo().clickCanisters();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async getSnsTokens(params: { amount: number; name: string }): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().getGetTokensPo().getSnsTokens(params);
    await this.closeMenu();
  }

  async getIcpTokens(amount: number): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().getGetTokensPo().getIcpTokens(amount);
    await this.closeMenu();
  }

  async getBtc(amount: number): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().getGetTokensPo().getBtc(amount);
    await this.closeMenu();
  }

  async getCurrentViewWithBackButtonPo(): Promise<BasePageObject | null> {
    const views = [
      this.getAccountsPo(),
      this.getWalletPo(),
      this.getNeuronsPo(),
      this.getNeuronDetailPo(),
      this.getProposalDetailPo(),
      this.getProjectDetailPo(),
      this.getCanisterDetailPo(),
    ];
    for (const view of views) {
      if (await view.isPresent()) {
        return view;
      }
    }
    return null;
  }

  async goBack(): Promise<void> {
    const currentView = await this.getCurrentViewWithBackButtonPo();
    if (isNullish(currentView)) {
      throw new Error("No known view with back button is present");
    }

    await this.getButton("back").click();
    currentView.waitForAbsent();
  }

  // Can be called regardless of whether a back button is present.
  // The back button will be called as long as there is a back button, until the
  // menu button appears.
  async goBackAllTheWay(): Promise<void> {
    for (;;) {
      const currentView = await this.getCurrentViewWithBackButtonPo();
      if (isNullish(currentView)) {
        return;
      }

      await this.getButton("back").click();
      currentView.waitForAbsent();
    }
  }

  waitForNotBusy(): Promise<void> {
    return this.getBusyScreenPo().waitForAbsent();
  }

  async openUniverses() {
    await this.getRoleButton("select-universe-card").waitFor();
    await this.getRoleButton("select-universe-card").click();

    const snsUniverseCards =
      await this.getSelectUniverseListPo().getSnsUniverseCards();
    expect(snsUniverseCards.length).toBeGreaterThanOrEqual(1);
  }
}
