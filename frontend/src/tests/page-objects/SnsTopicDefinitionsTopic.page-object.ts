import { TooltipPo } from "$tests/page-objects/Tooltip.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsTopicDefinitionsTopicPo extends BasePageObject {
  private static readonly TID = "sns-topic-definitions-topic-component";

  static under(element: PageObjectElement): SnsTopicDefinitionsTopicPo {
    return new SnsTopicDefinitionsTopicPo(
      element.byTestId(SnsTopicDefinitionsTopicPo.TID)
    );
  }

  static async allUnder(
    element: PageObjectElement
  ): Promise<SnsTopicDefinitionsTopicPo[]> {
    return (await element.allByTestId(SnsTopicDefinitionsTopicPo.TID)).map(
      (element) => SnsTopicDefinitionsTopicPo.under(element)
    );
  }

  getTopicName(): Promise<string> {
    return this.root.byTestId("topic-name").getText();
  }

  getTopicDescription(): Promise<string> {
    return this.root.byTestId("topic-description").getText();
  }

  getNsFunctionElementPos(): Promise<PageObjectElement[]> {
    return this.root.allByTestId("ns-function");
  }

  async getNsFunctionNames(): Promise<string[]> {
    const nsFunctionElements = await this.getNsFunctionElementPos();
    return Promise.all(
      nsFunctionElements.map((element) =>
        element.byTestId("ns-function-name").getText()
      )
    );
  }

  async getNsFunctionTooltipTexts(): Promise<string[]> {
    const nsFunctionElements = await this.getNsFunctionElementPos();
    return Promise.all(
      nsFunctionElements.map((element) =>
        TooltipPo.under(element).getTooltipText()
      )
    );
  }
}
