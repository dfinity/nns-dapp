/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import InputRange from "../../../../lib/components/ui/InputRange.svelte";
import InputRangeTest from "./InputRangeTest.svelte";

describe("InputRange", () => {
  const min = 0;
  const max = 100;
  const ariaLabel = "test";
  it("should render an input", () => {
    const { container } = render(InputRange, {
      props: { min, max, value: 25, ariaLabel },
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
  });

  it("should change value programatically", async () => {
    const { container, queryByTestId } = render(InputRangeTest);

    const input = container.querySelector("input");
    expect(input).not.toBeNull();

    // Should match values in InputRangeTest
    const initialValue = 25;
    const changedValue = 60;

    expect(input?.value).toBe(initialValue.toString());

    const button = queryByTestId("change-test-value");
    expect(button).not.toBeNull();

    button && (await fireEvent.click(button));
    expect(input?.value).toBe(changedValue.toString());
  });

  it("should bind the value", async () => {
    const initialValue = 25;
    const changedValue = 90;
    const { container } = render(InputRange, {
      props: { min, max, value: initialValue, ariaLabel },
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input?.value).toBe(initialValue.toString());

    input &&
      (await fireEvent.input(input, {
        target: {
          value: changedValue,
        },
      }));
    expect(input?.value).toBe(changedValue.toString());
  });

  it("should respect the max value", async () => {
    const initialValue = 25;
    const changedValue = max + initialValue;
    const { container } = render(InputRange, {
      props: { min, max, value: initialValue, ariaLabel },
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input?.value).toBe(initialValue.toString());

    input &&
      (await fireEvent.input(input, {
        target: {
          value: changedValue,
        },
      }));
    expect(input?.value).not.toBe(changedValue.toString());
  });

  it("should respect the min value", async () => {
    const initialValue = 25;
    const newMin = 20;
    const changedValue = 10;
    const { container } = render(InputRange, {
      props: { min: newMin, max, value: initialValue, ariaLabel },
    });

    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input?.value).toBe(initialValue.toString());

    input &&
      (await fireEvent.input(input, {
        target: {
          value: changedValue,
        },
      }));
    expect(input?.value).not.toBe(changedValue.toString());
  });
});
