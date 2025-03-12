import Card from "$lib/components/portfolio/Card.svelte";
import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
import StackedCards from "$lib/components/portfolio/StackedCards.svelte";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { StackedCardsPo } from "$tests/page-objects/StackedCards.page-object";
import { fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";

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

  it.only("should change active card when clicking a dot", async () => {
    const cards = [{ component: Card }, { component: Card }];
    const po = renderComponent(cards);
    const dotsPo = await po.getDots();
    const cardWrappers = await po.getCardWrappers();

    expect(dotsPo.length).toBe(2);
    expect(cardWrappers.length).toBe(2);

    expect(await po.getActiveCardIndex()).toBe(0);
    expect(await po.getActiveDotIndex()).toBe(0);

    await dotsPo[1].click();
    await tick();
    // await new Promise((resolve) => setTimeout(resolve, 10));
    // await tick();

    expect(await po.getActiveCardIndex()).toBe(1);
    expect(await po.getActiveDotIndex()).toBe(1);
  });

  it("should automatically rotate cards after interval", async () => {
    const cards = [{ component: Card }, { component: LoginCard }];
    const { container } = render(StackedCards, { props: { cards } });

    // First card should be active initially
    expect(
      container
        .querySelectorAll(".card-wrapper")[0]
        .classList.contains("active")
    ).toBe(true);

    // Advance timer by 5000ms (the rotation interval)
    vi.advanceTimersByTime(5000);
    await tick();

    // Now the second card should be active
    expect(
      container
        .querySelectorAll(".card-wrapper")[0]
        .classList.contains("active")
    ).toBe(false);
    expect(
      container
        .querySelectorAll(".card-wrapper")[1]
        .classList.contains("active")
    ).toBe(true);

    // Advance timer again to wrap around to the first card
    vi.advanceTimersByTime(5000);
    await tick();

    // First card should be active again
    expect(
      container
        .querySelectorAll(".card-wrapper")[0]
        .classList.contains("active")
    ).toBe(true);
    expect(
      container
        .querySelectorAll(".card-wrapper")[1]
        .classList.contains("active")
    ).toBe(false);
  });

  it("should reset timer when manually changing card", async () => {
    const cards = [{ component: Card }, { component: LoginCard }];
    const { container } = render(StackedCards, { props: { cards } });

    // Spy on clearInterval and setInterval
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const setIntervalSpy = vi.spyOn(window, "setInterval");

    // Click the second dot
    await fireEvent.click(container.querySelectorAll(".dot")[1]);

    // Should have cleared the interval and set a new one
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalled();
  });
});
