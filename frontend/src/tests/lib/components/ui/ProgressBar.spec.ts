/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProgressBarTest from "./ProgressBarTest.svelte";

describe("ProgressBar", () => {
  it("should render a progress element with value", () => {
    const value = 85;
    const { container } = render(ProgressBarTest, {
      props: { value, max: 100 },
    });

    const progressElement = container.querySelector("progress");
    expect(progressElement).not.toBeNull();
    progressElement && expect(progressElement.value).toBe(value);
  });

  it("should render a progress element with max value", () => {
    const value = 85;
    const max = 100;
    const { container } = render(ProgressBarTest, {
      props: { value, max },
    });

    const progressElement = container.querySelector("progress");
    expect(progressElement).not.toBeNull();
    progressElement && expect(progressElement.max).toBe(max);
  });

  it("should render top and bottom slots", () => {
    const value = 85;
    const max = 100;
    const { container } = render(ProgressBarTest, {
      props: { value, max, top: "test top", bottom: "test bottom" },
    });

    const progressElement = container.querySelector("progress");
    expect(progressElement).not.toBeNull();
    progressElement && expect(progressElement.max).toBe(max);
  });
});
