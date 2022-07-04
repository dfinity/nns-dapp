/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import ProjectStatusSection from "../../../../lib/components/project-detail/ProjectStatusSection.svelte";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";

describe("ProjectStatusSection", () => {
  const props = { project: mockSnsFullProject };
  it("should render subtitle", async () => {
    const { container } = render(ProjectStatusSection, { props });
    expect(container.querySelector("h2")).toBeInTheDocument();
  });

  it("should render project current commitment", async () => {
    const { queryByTestId } = render(ProjectStatusSection, { props });
    expect(queryByTestId("sns-project-current-commitment")).toBeInTheDocument();
  });

  it("should render project participate button", async () => {
    const { queryByTestId } = render(ProjectStatusSection, { props });
    expect(queryByTestId("sns-project-participate-button")).toBeInTheDocument();
  });

  it("should open swap participation modal on participate click", async () => {
    const { queryByTestId } = render(ProjectStatusSection, { props });
    await clickByTestId(queryByTestId, "sns-project-participate-button");
    await waitFor(() =>
      expect(queryByTestId("sns-swap-participate-step-1")).toBeInTheDocument()
    );
  });
});
