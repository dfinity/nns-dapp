import Card from "$lib/components/portfolio/Card.svelte";
import StackedCards from "$lib/components/portfolio/StackedCards.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { StackedCardsPo } from "$tests/page-objects/StackedCards.page-object";
import { render } from "@testing-library/svelte";

describe("StackedCards Component", () => {
  const renderComponent = (cards: unknown[]) => {
    const { container } = render(StackedCards, { props: { cards } });
    return StackedCardsPo.under(new JestPageObjectElement(container));
  };

  it("should render empty when no cards are provided", async () => {
    const po = renderComponent([]);
    const dotsPo = await po.getDots();

    expect(dotsPo.length).toBe(0);
  });

  it("should render a single card without dots", async () => {
    const cards = [{ component: Card }];
    const po = renderComponent(cards);
    const dotsPo = await po.getDots();
    const cardWrappers = await po.getCardWrappers();

    expect(dotsPo.length).toBe(0);
    expect(cardWrappers.length).toBe(1);
  });

  it("should render multiple cards with dots", async () => {
    const cards = [{ component: Card }, { component: Card }];
    const po = renderComponent(cards);
    const dotsPo = await po.getDots();
    const cardWrappers = await po.getCardWrappers();

    expect(dotsPo.length).toBe(2);
    expect(cardWrappers.length).toBe(2);
    expect(await po.getActiveCardIndex()).toBe(0);
    expect(await po.getActiveDotIndex()).toBe(0);
  });

  it("should change active card when clicking a dot", async () => {
    const cards = [{ component: Card }, { component: Card }];
    const po = renderComponent(cards);
    const dotsPo = await po.getDots();
    const cardWrappers = await po.getCardWrappers();

    expect(dotsPo.length).toBe(2);
    expect(cardWrappers.length).toBe(2);

    expect(await po.getActiveCardIndex()).toBe(0);
    expect(await po.getActiveDotIndex()).toBe(0);

    await dotsPo[1].click();

    expect(await po.getActiveCardIndex()).toBe(1);
    expect(await po.getActiveDotIndex()).toBe(1);
  });

  it("should automatically rotate cards after interval", async () => {
    vi.useFakeTimers();

    const cards = [
      { component: Card },
      { component: Card },
      { component: Card },
    ];
    const po = renderComponent(cards);
    const dotsPo = await po.getDots();
    const cardWrappers = await po.getCardWrappers();

    expect(dotsPo.length).toBe(3);
    expect(cardWrappers.length).toBe(3);

    expect(await po.getActiveCardIndex()).toBe(0);
    expect(await po.getActiveDotIndex()).toBe(0);

    vi.advanceTimersByTime(5000);

    expect(await po.getActiveCardIndex()).toBe(1);
    expect(await po.getActiveDotIndex()).toBe(1);

    vi.advanceTimersByTime(5000);

    expect(await po.getActiveCardIndex()).toBe(2);
    expect(await po.getActiveDotIndex()).toBe(2);
  });

  it("should reset timer when manually changing card", async () => {
    vi.useFakeTimers();

    const cards = [{ component: Card }, { component: Card }];
    const po = renderComponent(cards);
    const dotsPo = await po.getDots();

    expect(await po.getActiveCardIndex()).toBe(0);

    vi.advanceTimersByTime(4000);

    await dotsPo[1].click();
    expect(await po.getActiveCardIndex()).toBe(1);

    vi.advanceTimersByTime(4999);
    expect(await po.getActiveCardIndex()).toBe(1);

    vi.advanceTimersByTime(1);
    expect(await po.getActiveCardIndex()).toBe(0);
  });
});
