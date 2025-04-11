import { BasePageObject } from "$tests/page-objects/base.page-object";

export abstract class BasePortfolioCardPo extends BasePageObject {
  abstract getTitle(): Promise<string>;
}
