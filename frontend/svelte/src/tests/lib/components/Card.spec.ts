/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Card from "../../../lib/components/Card.svelte";

describe("Card", () => {
  it("should render an article when no link and no click event", () => {
    const { container } = render(Card);

    const article = container.querySelector("article");
    expect(article).not.toBeUndefined();
  });

  it("should not render an anchor tag by default", () => {
    const { container } = render(Card);

    const anchor = container.querySelector("a");
    expect(anchor).toBe(null);
  });

  it("should render an anchor tag when link", () => {
    const { container } = render(Card, {
      props: { to: "/link" }
    });

    const anchor = container.querySelector("a");
    expect(anchor).not.toBeUndefined();
  });
});
