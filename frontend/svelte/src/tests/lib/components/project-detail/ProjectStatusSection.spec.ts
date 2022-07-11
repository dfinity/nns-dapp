/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import ProjectStatusSection from "../../../../lib/components/project-detail/ProjectStatusSection.svelte";
import en from "../../../mocks/i18n.mock";
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

  it("should render accepting participation text when open", async () => {
    const { queryByText } = render(ProjectStatusSection, { props });
    expect(queryByText(en.sns_project_detail.accepting)).toBeInTheDocument();
  });

  it("should render pending text when not yet open", async () => {
    const { queryByText } = render(ProjectStatusSection, {
      props: {
        project: {
          ...mockSnsFullProject,
          summary: {
            ...mockSnsFullProject.summary,
            swapDeadline: BigInt(Math.round(Date.now() / 1000 + 40000)),
            swapStart: BigInt(Math.round(Date.now() / 1000 + 20000)),
          },
        },
      },
    });
    expect(queryByText(en.sns_project_detail.pending)).toBeInTheDocument();
  });

  it("should render closed text when not yet open", async () => {
    const { queryByText } = render(ProjectStatusSection, {
      props: {
        project: {
          ...mockSnsFullProject,
          summary: {
            ...mockSnsFullProject.summary,
            swapDeadline: BigInt(Math.round(Date.now() / 1000 - 20000)),
            swapStart: BigInt(Math.round(Date.now() / 1000 - 40000)),
          },
        },
      },
    });
    expect(queryByText(en.sns_project_detail.closed)).toBeInTheDocument();
  });
});
