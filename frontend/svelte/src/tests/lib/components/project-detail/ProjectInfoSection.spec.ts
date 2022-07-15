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
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("ProjectInfoSection", () => {
  const renderProjectInfoSection = () =>
    render(ContextWrapperTest, {
      props: {
        contextKey: PROJECT_DETAIL_CONTEXT_KEY,
        contextValue: {
          store: writable<ProjectDetailStore>({
            summary: mockSnsFullProject.summary,
            swapState: mockSnsFullProject.swapState,
          }),
        } as ProjectDetailContext,
        Component: ProjectInfoSection,
      },
    });

  it("should render title", async () => {
    const { container } = renderProjectInfoSection();
    expect(container.querySelector("h1")).toBeInTheDocument();
  });

  it("should render project link", async () => {
    const { container } = renderProjectInfoSection();
    expect(container.querySelector("a")).toBeInTheDocument();
  });
});
