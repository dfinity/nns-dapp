import { PROPOSER_ID_DISPLAY_SPLIT_LENGTH } from "$lib/constants/proposals.constants";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
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

  getListLoaderSpinnerPo(): PageObjectElement {
    return this.root.byTestId("next-page-proposals-spinner");
  }

  getProposalCardPos(): Promise<ProposalCardPo[]> {
    return ProposalCardPo.allUnder(this.root);
  }

  async getCardTopics(): Promise<string[]> {
    const topics = await Promise.all(
      (
        await this.getProposalCardPos()
      ).map((card) => card.getProposalTopicText())
    );

    // return unique values only
    return Array.from(new Set(topics));
  }

  async getFirstProposalCardPoForProposer(
    proposer: string
  ): Promise<ProposalCardPo> {
    const shortProposer = shortenWithMiddleEllipsis(
      proposer,
      PROPOSER_ID_DISPLAY_SPLIT_LENGTH
    );
    const allCards = await this.getProposalCardPos();

    for (const card of allCards) {
      if ((await card.getShortenedProposer()) === shortProposer) {
        return card;
      }
    }

    throw new Error(`No proposal card found for proposer ${proposer}`);
  }

  async getProposalIds(): Promise<string[]> {
    const cards = await this.getProposalCardPos();
    return Promise.all(cards.map((card) => card.getProposalId()));
  }

  async isContentLoaded(): Promise<boolean> {
    return (
      (await this.isPresent()) &&
      !(await this.getSkeletonCardPo().isPresent()) &&
      !(await this.getListLoaderSpinnerPo().isPresent())
    );
  }

  async waitForContentLoaded(): Promise<void> {
    await this.waitFor();
    await this.getSkeletonCardPo().waitForAbsent();
    await this.getListLoaderSpinnerPo().waitForAbsent();
  }
}
