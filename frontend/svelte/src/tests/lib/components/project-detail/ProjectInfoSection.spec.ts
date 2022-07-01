/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProjectInfoSection from "../../../../lib/components/project-detail/ProjectInfoSection.svelte";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";

describe("ProjectInfoSection", () => {
  const props = { summary: mockSnsFullProject.summary };
  it("should render title", async () => {
    const { container } = render(ProjectInfoSection, { props });
    expect(container.querySelector("h1")).toBeInTheDocument();
  });

  it("should render project link", async () => {
    const { container } = render(ProjectInfoSection, { props });
    expect(container.querySelector("a")).toBeInTheDocument();
  });
});
