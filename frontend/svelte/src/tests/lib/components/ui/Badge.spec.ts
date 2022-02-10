/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Badge from "../../../../lib/components/ui/Badge.svelte";
import BadgeTest from "./BadgeTest.svelte";

describe("Badge", () => {
  it("should render a badge container", () => {
    const { container } = render(Badge);

    expect(container.querySelector("div")).not.toBeNull();
  });

  it("should render the slot of the badge", () => {
    const { getByText } = render(BadgeTest);

    expect(getByText("Test_badge")).toBeInTheDocument();
  });

  it("should render a success badge", () => {
    const { container } = render(Badge, { props: { color: "success" } });

    expect(container.querySelector("div.success")).not.toBeNull();
  });

  it("should render a warning badge", () => {
    const { container } = render(Badge, { props: { color: "warning" } });

    expect(container.querySelector("div.warning")).not.toBeNull();
  });
});
