/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";
import ProjectInfoSection from "../../../../lib/components/project-detail/ProjectInfoSection.svelte";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "../../../../lib/types/project-detail.context";
import type { SnsSummary } from "../../../../lib/types/sns";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("ProjectInfoSection", () => {
  const renderProjectInfoSection = (summary: SnsSummary | undefined) =>
    render(ContextWrapperTest, {
      props: {
        contextKey: PROJECT_DETAIL_CONTEXT_KEY,
        contextValue: {
          store: writable<ProjectDetailStore>({
            summary,
            swapCommitment: mockSnsFullProject.swapCommitment,
          }),
        } as ProjectDetailContext,
        Component: ProjectInfoSection,
      },
    });

  it("should render title", async () => {
    const { container } = renderProjectInfoSection(mockSnsFullProject.summary);
    expect(container.querySelector("h1")).toBeInTheDocument();
  });

  it("should render project link", async () => {
    const { container } = renderProjectInfoSection(mockSnsFullProject.summary);
    expect(container.querySelector("a")).toBeInTheDocument();
  });

  it("should not render content if the summary is not yet defined", async () => {
    const { container } = renderProjectInfoSection(undefined);
    expect(container.querySelector("h1")).not.toBeInTheDocument();
  });
});
