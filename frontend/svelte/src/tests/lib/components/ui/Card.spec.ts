/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Card from "../../../../lib/components/ui/Card.svelte";

describe("Card", () => {
  it("should render an article", () => {
    const { container } = render(Card);

    const article = container.querySelector("article");
    expect(article).not.toBeNull();
  });

  it("should article with role and aria-label", () => {
    const role = "button";
    const ariaLabel = "go away";
    const { container } = render(Card, {
      props: { role, ariaLabel },
    });

    const article = container.querySelector("article");
    expect(article?.getAttribute("role")).toBe(role);
    expect(article?.getAttribute("aria-label")).toBe(ariaLabel);
  });

  it("should forward the click event", (done) => {
    const { container, component } = render(Card);

    component.$on("click", () => {
      done();
    });

    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    article && fireEvent.click(article);
  });
});
