import CardList from "$lib/components/launchpad/CardList.svelte";
import AdoptedProposalCard from "$lib/components/portfolio/AdoptedProposalCard.svelte";
import type { ComponentWithProps } from "$lib/types/svelte";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { AdoptedProposalCardPo } from "$tests/page-objects/AdoptedProposalCard.page-object";
import { CardListPo } from "$tests/page-objects/CardList.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("CardList", () => {
  const renderComponent = (props: { cards: ComponentWithProps[] }) => {
    const { container } = render(CardList, { props });
    return CardListPo.under(new JestPageObjectElement(container));
  };

  it("should render cards", async () => {
    const projectName1 = "Project 1";
    const projectName2 = "Project 2";
    const po = renderComponent({
      cards: [
        {
          Component: AdoptedProposalCard,
          props: {
            summary: createSummary({
              projectName: projectName1,
            }),
          },
        },
        {
          Component: AdoptedProposalCard,
          props: {
            summary: createSummary({
              projectName: projectName2,
            }),
          },
        },
      ],
    });

    const cardEntries = await po.getCardEntries();
    expect(cardEntries.length).toBe(2);
    expect(
      await AdoptedProposalCardPo.under(cardEntries[0].root).getTitle()
    ).toBe(projectName1);
    expect(
      await AdoptedProposalCardPo.under(cardEntries[1].root).getTitle()
    ).toBe(projectName2);
  });
});
