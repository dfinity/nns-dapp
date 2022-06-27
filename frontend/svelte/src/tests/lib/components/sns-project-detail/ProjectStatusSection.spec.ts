/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProjectStatusSection from "../../../../lib/components/sns-project-detail/ProjectStatusSection.svelte";

describe("ProjectStatusSection", () => {
  it("should render subtitle", async () => {
    const { container } = render(ProjectStatusSection);
    expect(container.querySelector("h2")).toBeInTheDocument();
  });

  it("should render project current commitment", async () => {
    const { queryByTestId } = render(ProjectStatusSection);
    expect(queryByTestId("sns-project-current-commitment")).toBeInTheDocument();
  });

  it("should render project participate button", async () => {
    const { queryByTestId } = render(ProjectStatusSection);
    expect(queryByTestId("sns-project-participate-button")).toBeInTheDocument();
  });
});
