/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import DateSeconds from "../../../../lib/components/ui/DateSeconds.svelte";

describe("DateSeconds", () => {
  const seconds = Number(BigInt("0"));

  const test = ({
    container,
    selector,
  }: {
    selector: "p" | "span";
    container: HTMLElement;
  }) => {
    expect(container.querySelector(selector)?.textContent).toContain(
      "January 1, 1970"
    );
    expect(container.querySelector(selector)?.textContent).toContain(
      "12:00 AM"
    );
  };

  it("displays render date and time", () => {
    const { container } = render(DateSeconds, {
      props: {
        seconds,
      },
    });

    test({ container, selector: "p" });
  });

  it("displays render date and time in a span", () => {
    const { container } = render(DateSeconds, {
      props: {
        seconds,
        tagName: "span",
      },
    });

    expect(container.querySelector("p")).toBeNull();

    test({ container, selector: "span" });
  });
});
