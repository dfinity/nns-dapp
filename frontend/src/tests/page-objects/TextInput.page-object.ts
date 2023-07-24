import { SimpleBasePageObject } from "$tests/page-objects/simple-base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";

export class TextInputPo extends SimpleBasePageObject {
  static under({
    element,
    testId,
  }: {
    element: PageObjectElement;
    testId?: string;
  }): TextInputPo {
    if (isNullish(testId)) {
      return new TextInputPo(
        element.querySelector(
          "input[type=text], input[type=number], input:not([type])"
        )
      );
    }
    return new TextInputPo(
      element.querySelector(
        `input[type=text][data-tid=${testId}], input:not([type])[data-tid=${testId}]`
      )
    );
  }

  typeText(text: string): Promise<void> {
    return this.root.typeText(text);
  }

  getValue(): Promise<string> {
    return this.root.getValue();
  }

  async isDisabled(): Promise<boolean> {
    return (await this.root.getAttribute("disabled")) !== null;
  }

  async isRequired(): Promise<boolean> {
    return (await this.root.getAttribute("required")) !== null;
  }
}
