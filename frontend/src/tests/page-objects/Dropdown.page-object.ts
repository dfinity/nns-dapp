import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { nonNullish } from "@dfinity/utils";

export class DropdownPo extends BasePageObject {
  private static readonly TID = "dropdown-component";

  static under(element: PageObjectElement): DropdownPo {
    return new DropdownPo(element.byTestId(DropdownPo.TID));
  }

  select(option: string): Promise<void> {
    return this.root.querySelector("select").selectOption(option);
  }

  async getOptions(): Promise<string[]> {
    const options = await this.root.querySelectorAll("option");
    return Promise.all(options.map((option) => option.getText()));
  }

  async waitForOption(testId: string): Promise<void> {
    return this.root.byTestId(testId).waitFor();
  }

  private getOptionElement(optionIndex: number): PageObjectElement {
    return this.root.querySelector(`option:nth-child(${optionIndex + 1})`);
  }

  async getOption(optionIndex: number): Promise<string> {
    return await this.getOptionElement(optionIndex).getText();
  }

  async isDisabled(optionIndex: number): Promise<boolean> {
    const value =
      await this.getOptionElement(optionIndex).getAttribute("disabled");
    return nonNullish(value);
  }

  async getOptionValue(optionIndex: number): Promise<string> {
    return await this.getOptionElement(optionIndex).getAttribute("value");
  }
}
