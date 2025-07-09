import { BasePageObject } from "$tests/page-objects/base.page-object";

// TODO(launchpad2): Remove after launchpad2 is fully implemented
export abstract class BasePortfolioCardPo extends BasePageObject {
  abstract getTitle(): Promise<string>;
}
