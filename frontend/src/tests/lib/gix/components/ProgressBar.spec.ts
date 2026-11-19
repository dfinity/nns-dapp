import ProgressBar from "$lib/gix/components/ProgressBar.svelte";
import { assertNonNullish } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import ProgressBarTest from "./ProgressBarTest.svelte";

describe("ProgressBar", () => {
  it("should render a progress element with value", () => {
    const value = 85;
    const { container } = render(ProgressBarTest, {
      props: { value, max: 100 },
    });

    const progressElement = container.querySelector("progress");

    assertNonNullish(progressElement);

    expect(progressElement.value).toBe(value);
  });

  it("should render a progress element with max value", () => {
    const value = 85;
    const max = 100;
    const { container } = render(ProgressBarTest, {
      props: { value, max },
    });

    const progressElement = container.querySelector("progress");

    assertNonNullish(progressElement);

    expect(progressElement.max).toBe(max);
  });

  it("should use segment prop to calculate the prop", () => {
    const value = 85;
    const max = 100;
    const segments = [
      { value: 10, color: "red" },
      { value: 30, color: "green" },
    ];
    const { container } = render(ProgressBar, {
      props: { value, max, segments },
    });

    const progressElement = container.querySelector("progress");

    assertNonNullish(progressElement);

    // 40 is the sum of the segments
    expect(progressElement.value).toBe(40);
  });

  it("should render top and bottom slots", () => {
    const value = 85;
    const max = 100;
    const { container } = render(ProgressBarTest, {
      props: { value, max, top: "test top", bottom: "test bottom" },
    });

    const progressElement = container.querySelector("progress");

    assertNonNullish(progressElement);

    expect(progressElement.max).toBe(max);
  });
});
