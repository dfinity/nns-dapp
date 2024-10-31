import { ToastPo } from "$tests/page-objects/Toast.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class ToastsPo extends BasePageObject {
  private static readonly TID = "toasts-component";

  static under(element: PageObjectElement): ToastsPo {
    return new ToastsPo(element.byTestId(ToastsPo.TID));
  }

  getToastPo(): ToastPo {
    return ToastPo.under(this.root);
  }

  getToastPos(): Promise<ToastPo[]> {
    return ToastPo.allUnder(this.root);
  }

  async getMessages(): Promise<string[]> {
    const toasts = await this.getToastPos();
    return Promise.all(toasts.map((toast) => toast.getMessage()));
  }

  async closeAll(): Promise<void> {
    const toasts = await this.getToastPos();
    await Promise.all(toasts.map((toast) => toast.close()));
    await Promise.all(toasts.map((toast) => toast.waitForAbsent()));
  }
}
