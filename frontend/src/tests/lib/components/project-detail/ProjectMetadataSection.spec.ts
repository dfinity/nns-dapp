/**
 * @jest-environment jsdom
 */

import ProjectMetadataSection from "$lib/components/project-detail/ProjectMetadataSection.svelte";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "$lib/types/project-detail.context";
import type { SnsSummary } from "$lib/types/sns";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("ProjectMetadataSection", () => {
  const renderProjectMetadataSection = (summary: SnsSummary | undefined) =>
    render(ContextWrapperTest, {
      props: {
        contextKey: PROJECT_DETAIL_CONTEXT_KEY,
        contextValue: {
          store: writable<ProjectDetailStore>({
            summary,
            swapCommitment: mockSnsFullProject.swapCommitment,
          }),
        } as ProjectDetailContext,
        Component: ProjectMetadataSection,
      },
    });

  it("should render title", async () => {
    const { container } = renderProjectMetadataSection(
      mockSnsFullProject.summary
    );

    const element = container.querySelector("h1") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.textContent).toEqual(
      mockSnsFullProject.summary.metadata.name
    );
  });

  it("should render project link", async () => {
    const { container } = renderProjectMetadataSection(
      mockSnsFullProject.summary
    );

    const element = container.querySelector("a") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.getAttribute("href")).toEqual(
      mockSnsFullProject.summary.metadata.url
    );
  });

  it("should not render content if the summary is not yet defined", async () => {
    const { getByTestId } = renderProjectMetadataSection(undefined);
    const call = () => getByTestId("sns-project-detail-metadata");
    expect(call).toThrow();
  });

  it("should render project description", async () => {
    const { container } = renderProjectMetadataSection(
      mockSnsFullProject.summary
    );

    const element = container.querySelector("p:first-of-type") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.textContent).toEqual(
      mockSnsFullProject.summary.metadata.description
    );
  });

  it("should render project logo", async () => {
    const { container } = renderProjectMetadataSection(
      mockSnsFullProject.summary
    );

    const element = container.querySelector("img") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.getAttribute("src")).toEqual(
      mockSnsFullProject.summary.metadata.logo
    );
  });
});
