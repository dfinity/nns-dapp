/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProjectInfoSection from "../../../../lib/components/sns-project-detail/ProjectInfoSection.svelte";

describe("ProjectInfoSection", () => {
  it("should render title", async () => {
    const { container } = render(ProjectInfoSection);
    expect(container.querySelector("h1")).toBeInTheDocument();
  });

  it("should render project link", async () => {
    const { container } = render(ProjectInfoSection);
    expect(container.querySelector("a")).toBeInTheDocument();
  });
});
