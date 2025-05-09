import Card from "$lib/components/portfolio/Card.svelte";
import StackedCards from "$lib/components/portfolio/StackedCards.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { StackedCardsPo } from "$tests/page-objects/StackedCards.page-object";
import { render } from "@testing-library/svelte";

const MAX_NUMBER_OF_DOTS = 7;

describe("StackedCards Component", () => {
  const renderComponent = (cards: unknown[]) => {
    const { container } = render(StackedCards, { props: { cards } });
    return StackedCardsPo.under(new JestPageObjectElement(container));
  };

  it("should render empty when no cards are provided", async () => {
    const po = renderComponent([]);
    const dotsPo = await po.getDots();
    const hasDotsNavigation = await po.hasDotsNavigation();
    const hasButtonsNavigation = await po.hasButtonsNavigation();

    expect(dotsPo.length).toBe(0);
    expect(hasDotsNavigation).toBe(false);
    expect(hasButtonsNavigation).toBe(false);
  });

  it("should render a single card without dots or buttons", async () => {
    const cards = [{ component: Card }];
    const po = renderComponent(cards);
    const dotsPo = await po.getDots();
    const cardWrappers = await po.getCardWrappers();
    const hasDotsNavigation = await po.hasDotsNavigation();
    const hasButtonsNavigation = await po.hasButtonsNavigation();

    expect(dotsPo.length).toBe(0);
    expect(cardWrappers.length).toBe(1);
    expect(hasDotsNavigation).toBe(false);
    expect(hasButtonsNavigation).toBe(false);
  });

  it("should render multiple cards with dots when cards are <= MAX_NUMBER_OF_DOTS", async () => {
    const cards = [{ component: Card }, { component: Card }];
    const po = renderComponent(cards);
    const dotsPo = await po.getDots();
    const cardWrappers = await po.getCardWrappers();
    const hasDotsNavigation = await po.hasDotsNavigation();
    const hasButtonsNavigation = await po.hasButtonsNavigation();

    expect(dotsPo.length).toBe(2);
    expect(cardWrappers.length).toBe(2);
    expect(await po.getActiveCardIndex()).toBe(0);
    expect(await po.getActiveDotIndex()).toBe(0);
    expect(hasDotsNavigation).toBe(true);
    expect(hasButtonsNavigation).toBe(false);
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

  it("should render buttons instead of dots when cards are > MAX_NUMBER_OF_DOTS", async () => {
    const cards = Array(MAX_NUMBER_OF_DOTS + 1).fill({ component: Card });
    const po = renderComponent(cards);
    const cardWrappers = await po.getCardWrappers();
    const hasDotsNavigation = await po.hasDotsNavigation();
    const hasButtonsNavigation = await po.hasButtonsNavigation();
    
    expect(cardWrappers.length).toBe(MAX_NUMBER_OF_DOTS + 1);
    expect(hasDotsNavigation).toBe(false);
    expect(hasButtonsNavigation).toBe(true);
    expect(await po.getCurrentIndexDisplay()).toBe(1); // 1-indexed
  });

  it("should navigate with prev/next buttons", async () => {
    const cards = Array(MAX_NUMBER_OF_DOTS + 2).fill({ component: Card });
    const po = renderComponent(cards);
    const prevButton = await po.getPrevButton();
    const nextButton = await po.getNextButton();

    expect(await po.getActiveCardIndex()).toBe(0);
    expect(await po.getCurrentIndexDisplay()).toBe(1); // 1-indexed

    await nextButton.click();
    expect(await po.getActiveCardIndex()).toBe(1);
    expect(await po.getCurrentIndexDisplay()).toBe(2);

    await nextButton.click();
    expect(await po.getActiveCardIndex()).toBe(2);
    expect(await po.getCurrentIndexDisplay()).toBe(3);

    await prevButton.click();
    expect(await po.getActiveCardIndex()).toBe(1);
    expect(await po.getCurrentIndexDisplay()).toBe(2);

    // Test wrap-around behavior
    const totalCards = MAX_NUMBER_OF_DOTS + 2;
    for (let i = 0; i < totalCards - 1; i++) {
      await nextButton.click();
    }
    expect(await po.getActiveCardIndex()).toBe(0);
    expect(await po.getCurrentIndexDisplay()).toBe(1);

    await prevButton.click();
    expect(await po.getActiveCardIndex()).toBe(totalCards - 1);
    expect(await po.getCurrentIndexDisplay()).toBe(totalCards);
  });

  it("should reset timer when navigating with buttons", async () => {
    vi.useFakeTimers();

    const cards = Array(MAX_NUMBER_OF_DOTS + 1).fill({ component: Card });
    const po = renderComponent(cards);
    const nextButton = await po.getNextButton();

    expect(await po.getActiveCardIndex()).toBe(0);

    vi.advanceTimersByTime(4000);

    await nextButton.click();
    expect(await po.getActiveCardIndex()).toBe(1);

    vi.advanceTimersByTime(4999);
    expect(await po.getActiveCardIndex()).toBe(1);

    vi.advanceTimersByTime(1);
    expect(await po.getActiveCardIndex()).toBe(2);
  });
});
