/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProjectCard from "../../../../lib/components/launchpad/ProjectCard.svelte";
import en from "../../../mocks/i18n.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSummary: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapStateStore: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("ProjectCard", () => {
  it("should render a logo", () => {
    const { container } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const img = container.querySelector("img");

    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toBe(mockSnsFullProject.summary.logo);
  });

  it("should render a title", () => {
    const { getByText } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    expect(
      getByText(`${en.sns_project.project} ${mockSnsFullProject.summary.name}`)
    ).toBeInTheDocument();
  });

  it("should render a description", () => {
    const { getByText } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    expect(
      getByText(mockSnsFullProject.summary.description)
    ).toBeInTheDocument();
  });

  it("should display a spinner when the swapCommitment is not loaded", () => {
    const { getByTestId } = render(ProjectCard, {
      props: {
        project: { ...mockSnsFullProject, swapCommitment: undefined },
      },
    });

    expect(getByTestId("spinner")).toBeInTheDocument();
  });

  it("should render swap info", () => {
    const { getByText } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    expect(getByText(en.sns_project_detail.deadline)).toBeInTheDocument();
    expect(
      getByText(en.sns_project_detail.user_commitment)
    ).toBeInTheDocument();
  });
});
