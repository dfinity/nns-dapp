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

  getProposalCardPo(): ProposalCardPo {
    return ProposalCardPo.under(this.root);
  }

  getProposalCardPos(): Promise<ProposalCardPo[]> {
    return ProposalCardPo.allUnder(this.root);
  }

  async getCardTopics(): Promise<string[]> {
    const topics = await Promise.all(
      (await this.getProposalCardPos()).map((card) =>
        card.getProposalTopicText()
      )
    );

    // return unique values only
    return Array.from(new Set(topics));
  }

  async getCardStatuses(): Promise<string[]> {
    const statuses = await Promise.all(
      (await this.getProposalCardPos()).map((card) =>
        card.getProposalStatusText()
      )
    );

    // return unique values only
    return Array.from(new Set(statuses));
  }

  async getProposalCardPosForProposer(
    proposer: string
  ): Promise<ProposalCardPo[]> {
    const allCards = await this.getProposalCardPos();
    const proposerCards = [];

    for (const card of allCards) {
      if ((await card.getProposer()) === proposer) {
        proposerCards.push(card);
      }
    }

    return proposerCards;
  }

  async getFirstProposalCardPoForProposer(
    proposer: string
  ): Promise<ProposalCardPo> {
    const proposerCards = await this.getProposalCardPosForProposer(proposer);
    if (proposerCards.length > 0) {
      return proposerCards[0];
    }

    throw new Error(`No proposal card found for proposer ${proposer}`);
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
    this.getSkeletonCardPo().waitForAbsent();
    // The NnsProposals component loads neurons and proposals at the same time.
    // But once neurons are loaded, it loads proposals again. So it's possible
    // that the component goes back into loading state immediately after
    // proposals are loaded.
    // TODO: Fix NnsProposals to load proposals only once and remove the 2 lines
    // below.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.getSkeletonCardPo().waitForAbsent();
  }

  async getVisibleProposalIds(proposerNeuronId: string): Promise<string[]> {
    return Promise.all(
      (await this.getProposalCardPosForProposer(proposerNeuronId)).map((card) =>
        card.getProposalId()
      )
    );
  }
}
