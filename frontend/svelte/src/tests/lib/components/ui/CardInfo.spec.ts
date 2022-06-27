/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import CardInfo from "../../../../lib/components/ui/CardInfo.svelte";
import CardInfoTest from "./CardInfoTest.svelte";

describe("CardInfo", () => {
  it("should render an article", () => {
    const { container } = render(CardInfo);

    const article = container.querySelector("article");
    expect(article).not.toBeNull();
  });

  it("should render no header", () => {
    const { container } = render(CardInfoTest);

    const header = container.querySelector("article > div");
    expect(header).toBeNull();
  });
});
