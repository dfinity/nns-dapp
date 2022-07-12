/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProjectCard from "../../../../lib/components/launchpad/ProjectCard.svelte";
import { secondsToDuration } from "../../../../lib/utils/date.utils";
import { formatICP } from "../../../../lib/utils/icp.utils";
import en from "../../../mocks/i18n.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import {
  loadSnsSummaries,
  loadSnsSummary,
  loadSnsSwapStates,
  loadSnsSwapStateStore
} from '../../../../lib/services/sns.services';

jest.mock("../../../../lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSummary: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapStateStore: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("ProjectCard", () => {
  it("should render a logo", async () => {
    const { container } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const img = container.querySelector("img");

    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toBe(mockSnsFullProject.summary.logo);
  });

  it("should render a title", async () => {
    const { getByText } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    expect(
      getByText(`${en.sns_project.project} ${mockSnsFullProject.summary.name}`)
    ).toBeInTheDocument();
  });

  it("should render a description", async () => {
    const { getByText } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    expect(
      getByText(mockSnsFullProject.summary.description)
    ).toBeInTheDocument();
  });

  it("should display a spinner when the swapState is not loaded", async () => {
    const { getByTestId } = render(ProjectCard, {
      props: {
        project: { ...mockSnsFullProject, swapState: undefined },
      },
    });

    expect(getByTestId("spinner")).toBeInTheDocument();
  });

  it("should render deadline", async () => {
    const { getByText } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const durationTillDeadline =
      mockSnsFullProject.summary.swapDeadline -
      BigInt(Math.round(Date.now() / 1000));

    expect(
      getByText(secondsToDuration(durationTillDeadline))
    ).toBeInTheDocument();
  });

  it("should render my commitment", async () => {
    const { getByText } = render(ProjectCard, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const icpValue = formatICP({
      value: mockSnsFullProject.swapState?.myCommitment as bigint,
    });

    expect(getByText(icpValue, { exact: false })).toBeInTheDocument();
  });
});
