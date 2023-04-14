import { AccountsPo } from "$tests/page-objects/Accounts.page-object";
import { BackdropPo } from "$tests/page-objects/Backdrop.page-object";
import { MenuItemsPo } from "$tests/page-objects/MenuItems.page-object";
import { NeuronsPo } from "$tests/page-objects/Neurons.page-object";
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

  toggleMenu(): Promise<void> {
    return this.getMenuTogglePo().click();
  }

  async openMenu(): Promise<void> {
    // Whether the menu needs to be opened depends on the size of the viewport.
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
  }

  async getTokens(amount: number): Promise<void> {
    await this.openMenu();
    await this.getMenuItemsPo().getGetTokensPo().getTokens(amount);
    await this.closeMenu();
  }

  goBack(): Promise<void> {
    return this.getButton("back").click();
  }
}
