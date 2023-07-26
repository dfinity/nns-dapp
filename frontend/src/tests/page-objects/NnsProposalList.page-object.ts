import { ProposalCardPo } from "$tests/page-objects/ProposalCard.page-object";
import { SkeletonCardPo } from "$tests/page-objects/SkeletonCard.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class NnsProposalListPo extends BasePageObject {
  private static readonly TID = "nns-proposal-list-component";

  static under(element: PageObjectElement): NnsProposalListPo {
    return new NnsProposalListPo(element.byTestId(NnsProposalListPo.TID));
  }

  getSkeletonCardPo(): SkeletonCardPo {
    return SkeletonCardPo.under(this.root);
  }

  getProposalCardPos(): Promise<ProposalCardPo[]> {
    return ProposalCardPo.allUnder(this.root);
  }

  async getProposalCardTopics(): Promise<string[]> {
    const topics = await Promise.all(
      (
        await this.getProposalCardPos()
      ).map((card) => card.getProposalTopicText())
    );

    // return unique values only
    return Array.from(new Set(topics));
  }

  async getProposalCardStatuses(): Promise<string[]> {
    const statuses = await Promise.all(
      (
        await this.getProposalCardPos()
      ).map((card) => card.getProposalStatusText())
    );

    // return unique values only
    return Array.from(new Set(statuses));
  }

  async getProposalIds(): Promise<string[]> {
    const cards = await this.getProposalCardPos();
    return Promise.all(cards.map((card) => card.getProposalId()));
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
}
