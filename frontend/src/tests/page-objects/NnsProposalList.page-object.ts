import { NnsProposalFiltersPo } from "$tests/page-objects/NnsProposalFilters.page-object";
import { NoProposalsPo } from "$tests/page-objects/NoProposals.page-object";
import { PageBannerPo } from "$tests/page-objects/PageBanner.page-object";
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

  hasListLoaderSpinner(): Promise<boolean> {
    return this.isPresent("next-page-sns-proposals-spinner");
  }

  getAllProposalList(): PageObjectElement {
    return this.root.byTestId("all-proposal-list");
  }

  getActionableProposalList(): PageObjectElement {
    return this.root.byTestId("actionable-proposal-list");
  }

  getNnsProposalFiltersPo(): NnsProposalFiltersPo {
    return NnsProposalFiltersPo.under(this.root);
  }

  getProposalCardPo(): ProposalCardPo {
    return ProposalCardPo.under(this.root);
  }

  getProposalCardPos(): Promise<ProposalCardPo[]> {
    return ProposalCardPo.allUnder(this.root);
  }

  getActionableSignInBanner(): PageBannerPo {
    return PageBannerPo.under({
      element: this.root,
      testId: "actionable-proposals-sign-in",
    });
  }

  getActionableEmptyBanner(): PageBannerPo {
    return PageBannerPo.under({
      element: this.root,
      testId: "actionable-proposals-empty",
    });
  }

  getNoProposalsPo(): NoProposalsPo {
    return NoProposalsPo.under(this.root);
  }

  hasSpinner(): Promise<boolean> {
    return this.isPresent("spinner");
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
    await this.waitFor();
    await this.getSkeletonCardPo().waitForAbsent();
  }

  async getVisibleProposalIds(proposerNeuronId: string): Promise<string[]> {
    return Promise.all(
      (await this.getProposalCardPosForProposer(proposerNeuronId)).map((card) =>
        card.getProposalId()
      )
    );
  }
}
