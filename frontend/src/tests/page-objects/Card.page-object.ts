import { BasePageObject } from "$tests/page-objects/base.page-object";

// CardPo should not be used directly but rather as a base class for specific
// card components.
export class CardPo extends BasePageObject {
  async hasClass(className: string): Promise<boolean> {
    const classNames = await this.root.getClasses();
    return classNames.includes(className);
  }

  async isSelected(): Promise<boolean> {
    return this.hasClass("selected");
  }

  async isHighlighted(): Promise<boolean> {
    return this.hasClass("highlighted");
  }

  async isDisabled(): Promise<boolean> {
    return this.hasClass("disabled");
  }
}
