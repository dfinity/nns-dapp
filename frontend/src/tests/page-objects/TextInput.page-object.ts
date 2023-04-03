import type { PageObjectElement } from "$tests/types/page-object.types";
import { isNullish } from "@dfinity/utils";
import { SimpleBasePageObject } from "./simple-base.page-object";

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
        element.querySelector("input[type=text], input:not([type])")
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
}
