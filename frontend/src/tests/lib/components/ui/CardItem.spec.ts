/**
 * @jest-environment jsdom
 */

import { fireEvent } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import CardItem from "./CardItemTest.svelte";

describe("CardItem", () => {
  const props = {
    title: "Test",
    subtitle: "Subtitle text",
  };

  it("should render a div with role button", () => {
    const { container } = render(CardItem, { props });

    expect(
      container.querySelector("article[role='button']")
    ).toBeInTheDocument();
  });

  it("should forward the click event", (done) => {
    const { container, component } = render(CardItem, { props });

    component.$on("click", () => {
      done();
    });

    const element = container.querySelector("article[role='button']");
    expect(element).not.toBeNull();
    element && fireEvent.click(element);
  });

  it("should add a data test id", () => {
    const testId = "test-id";
    const { queryByTestId } = render(CardItem, { props: { ...props, testId } });

    expect(queryByTestId(testId)).toBeInTheDocument();
  });
});
