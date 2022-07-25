/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import CardBlockTest from "./CardBlockTest.svelte";

describe("CardBlock", () => {
  it("should render an article", () => {
    const { container } = render(CardBlockTest);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("should render title", () => {
    const { getByText } = render(CardBlockTest);
    expect(getByText("title")).toBeInTheDocument();
  });

  it("should render content", () => {
    const { getByText } = render(CardBlockTest);
    expect(getByText("content")).toBeInTheDocument();
  });

  it("should render expandable", () => {
    const { getByTestId } = render(CardBlockTest, {
      props: {
        expandable: true,
      },
    });
    expect(getByTestId("collapsible-header")).toBeInTheDocument();
  });

  it("should expandable be initially expanded", () => {
    const { container } = render(CardBlockTest, {
      props: {
        expandable: true,
      },
    });
    expect(
      container.querySelector('[aria-expanded="true"]')
    ).toBeInTheDocument();
  });
});
