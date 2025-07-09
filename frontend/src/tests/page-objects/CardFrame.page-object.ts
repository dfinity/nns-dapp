import { BasePageObject } from "$tests/page-objects/base.page-object";

// CardFramePo should not be used directly but rather as a base class for launchpad cards.
export abstract class CardFramePo extends BasePageObject {
  abstract getTitle(): Promise<string>;

  async hasClass(className: string): Promise<boolean> {
    const classNames = await this.root.getClasses();
    return classNames.includes(className);
  }

  async isHighlighted(): Promise<boolean> {
    return this.hasClass("highlighted");
  }

  async hasBackgroundIcon(): Promise<boolean> {
    return this.root.byTestId("background-icon").isPresent();
  }
}
