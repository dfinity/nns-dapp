import { AccountMenuPo } from "$tests/page-objects/AccountMenu.page-object";
import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { BackdropPo } from "$tests/page-objects/Backdrop.page-object";
import { BusyScreenPo } from "$tests/page-objects/BusyScreen.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { LaunchpadPo } from "$tests/page-objects/Launchpad.page-object";
import { LoginLinksPo } from "$tests/page-objects/LoginLinks.page-object";
import { MenuItemsPo } from "$tests/page-objects/MenuItems.page-object";
import { NeuronDetailPo } from "$tests/page-objects/NeuronDetail.page-object";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
import { ProjectDetailPo } from "$tests/page-objects/ProjectDetail.page-object";
import { ProposalDetailPo } from "$tests/page-objects/ProposalDetail.page-object";
import { ProposalsPo } from "$tests/page-objects/Proposals.page-object";
import { SelectUniverseListPo } from "$tests/page-objects/SelectUniverseList.page-object";
import { SignInPo } from "$tests/page-objects/SignIn.page-object";
import { WalletPo } from "$tests/page-objects/Wallet.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";

export class AppPo extends BasePageObject {
  getLoginLinksPo(): LoginLinksPo {
    return LoginLinksPo.under(this.root);
  }

  getSignInPo(): SignInPo {
    return SignInPo.under(this.root);
  }

  getAccountMenuPo(): AccountMenuPo {
    return AccountMenuPo.under(this.root);
  }

  getAccountsPo(): AccountsPo {
    return AccountsPo.under(this.root);
  }

  getWalletPo(): WalletPo {
    return WalletPo.under(this.root);
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

  async goToAccounts(): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().clickAccounts();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async goToNeurons(): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().clickNeuronStaking();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async goToNeuronDetails(neuronId: string): Promise<void> {
    await this.goToNeurons();
    await (
      await this.getNeuronsPo().getNnsNeuronsPo().getNeuronCardPo(neuronId)
    ).click();
    await this.getNeuronDetailPo().waitFor();
  }

  async goToProposals(): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().clickProposals();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async goToLaunchpad(): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().clickLaunchpad();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async getTokens(amount: number): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().getGetTokensPo().getTokens(amount);
    await this.closeMenu();
  }

  async goBack(): Promise<void> {
    await this.getButton("back").click();
    await this.getButton("back").waitForAbsent();
  }

  waitForNotBusy(): Promise<void> {
    return this.getBusyScreenPo().waitForAbsent();
  }
}
