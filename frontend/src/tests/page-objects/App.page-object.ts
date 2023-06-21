import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { BackdropPo } from "$tests/page-objects/Backdrop.page-object";
import { BusyScreenPo } from "$tests/page-objects/BusyScreen.page-object";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { LaunchpadPo } from "$tests/page-objects/Launchpad.page-object";
import { MenuItemsPo } from "$tests/page-objects/MenuItems.page-object";
import { NeuronDetailPo } from "$tests/page-objects/NeuronDetail.page-object";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
import { ProjectDetailPo } from "$tests/page-objects/ProjectDetail.page-object";
import { SelectUniverseListPo } from "$tests/page-objects/SelectUniverseList.page-object";
import { WalletPo } from "$tests/page-objects/Wallet.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";

export class AppPo extends BasePageObject {
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

  waitForHeaderLoaded(): Promise<void> {
    return this.root.byTestId("header-component").waitFor();
  }

  async openMenu(): Promise<void> {
    // On large viewports, the menu is always open, but on smaller windows, we
    // need to click the menu toggle to open the menu. So we check if the menu toggle is
    // there and wait for the menu to open if necessary.

    // If the header isn't loaded yet, it looks like the menu toggle isn't
    // there but it's just not there *yet*.
    await this.waitForHeaderLoaded();
    const isTogglePresent = await this.getMenuTogglePo().isPresent();
    if (isTogglePresent) {
      const backdrop = this.getBackdropPo();
      if (await backdrop.isPresent()) {
        throw Error("Menu is already open");
      }
      await this.toggleMenu();
      await backdrop.waitFor();
    }
  }

  async closeMenu(): Promise<void> {
    // Whether the menu needs to be closed depends on the size of the viewport.
    const isTogglePresent = await this.getMenuTogglePo().isPresent();
    if (isTogglePresent) {
      const backdrop = this.getBackdropPo();
      if (!(await backdrop.isPresent())) {
        throw Error("Menu is already closed");
      }
      await this.toggleMenu();
      await backdrop.waitForAbsent();
    }
  }

  async goToNeurons(): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().clickNeuronStaking();
    // Menu closes automatically.
    await this.getBackdropPo().waitForAbsent();
  }

  async goToNeuronDetailsById(neuronId: string): Promise<void> {
    await this.goToNeurons();
    await (
      await this.getNeuronsPo().getNnsNeuronsPo().getNeuronCardPo(neuronId)
    ).click();
    await this.getNeuronDetailPo().waitFor();
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

  goBack(): Promise<void> {
    return this.getButton("back").click();
  }

  waitForNotBusy(): Promise<void> {
    return this.getBusyScreenPo().waitForAbsent();
  }
}
