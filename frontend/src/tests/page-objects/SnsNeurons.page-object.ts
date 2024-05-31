import { NeuronsTablePo } from "$tests/page-objects/NeuronsTable.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { SnsNeuronCardPo } from "$tests/page-objects/SnsNeuronCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class SnsNeuronsPo extends BasePageObject {
  private static readonly TID = "sns-neurons-component";

  static under(element: PageObjectElement): SnsNeuronsPo {
    return new SnsNeuronsPo(element.byTestId(SnsNeuronsPo.TID));
  }

  getNeuronsTablePo(): NeuronsTablePo {
    return NeuronsTablePo.under(this.root);
  }

  getSkeletonCardPo(): SkeletonCardPo {
    // There are multiple but we only need one.
    return SkeletonCardPo.under(this.root);
  }

  getNeuronCardPos(): Promise<SnsNeuronCardPo[]> {
    return SnsNeuronCardPo.allUnder(this.root);
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) && !(await this.getSkeletonCardPo().isPresent())
    );
  }

  async waitForContentLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonCardPo().waitForAbsent();
  }

  getEmptyMessage(): Promise<string> {
    return this.getText("empty-message-component");
  }

  async getNeuronIds(): Promise<string[]> {
    const cards = await this.getNeuronCardPos();
    return Promise.all(cards.map((card) => card.getNeuronId()));
  }

  hasNonNeuronFundNeuronsGrid(): Promise<boolean> {
    return this.isPresent("sns-neurons-body");
  }

  hasNeuronFundNeuronsGrid(): Promise<boolean> {
    return this.isPresent("fund-neurons-grid");
  }

  hasEmptyMessage(): Promise<boolean> {
    return this.isPresent("empty-message-component");
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
  }
}
