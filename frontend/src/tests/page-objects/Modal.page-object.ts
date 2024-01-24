import { BasePageObject } from "$tests/page-objects/base.page-object";

// ModalPo should not be used directly but rather as a base class for specific
// modal components.
export class ModalPo extends BasePageObject {
  getModalTitle(): Promise<string> {
    return this.getText("modal-title");
  }

  closeModal(): Promise<void> {
    return this.click("close-modal");
  }

  waitForClosed(): Promise<void> {
    return this.root.waitForAbsent();
  }
}

