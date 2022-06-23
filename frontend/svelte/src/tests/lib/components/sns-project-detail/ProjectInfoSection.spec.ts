/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProjectInfoSection from "../../../../lib/components/sns-project-detail/ProjectInfoSection.svelte";

describe("ProjectInfoSection", () => {
  it("should render title", async () => {
    const { queryByTestId } = render(ProjectInfoSection);
    expect(queryByTestId("sns-project-detail-title")).toBeInTheDocument();
  });

  it("should render project link", async () => {
    const { queryByTestId } = render(ProjectInfoSection);
    expect(queryByTestId("sns-project-detail-link")).toBeInTheDocument();
  });
});
