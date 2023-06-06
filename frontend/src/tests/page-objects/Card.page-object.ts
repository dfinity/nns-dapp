import { BasePageObject } from "$tests/page-objects/base.page-object";

// This should not be used directly but rather as a base class for specific
// card components.
export class CardPo extends BasePageObject {
  async hasClass(className: string): Promise<boolean> {
    const classNames = (await this.root.getAttribute("class")).split(" ");
    return classNames.includes(className);
  }

  async isSelected(): Promise<boolean> {
    //console.log('dskloetx CardPo root', (this.root as JestPageObjectElement).element.outerHTML);
    return this.hasClass("selected");
  }

  async isHighlighted(): Promise<boolean> {
    return this.hasClass("highlighted");
  }

  async isDisabled(): Promise<boolean> {
    return this.hasClass("disabled");
  }
}
