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

    const element = container.querySelector("h1") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.textContent).toEqual(
      mockSnsFullProject.summary.metadata.name
    );
  });

  it("should render project link", async () => {
    const { container } = renderProjectInfoSection(mockSnsFullProject.summary);

    const element = container.querySelector("a") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.getAttribute("href")).toEqual(
      mockSnsFullProject.summary.metadata.url
    );
  });

  it("should not render content if the summary is not yet defined", async () => {
    const { getByTestId } = renderProjectInfoSection(undefined);
    const call = () => getByTestId("sns-project-detail-info");
    expect(call).toThrow();
  });

  it("should render project description", async () => {
    const { container } = renderProjectInfoSection(mockSnsFullProject.summary);

    const element = container.querySelector("p:first-of-type") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.textContent).toEqual(
      mockSnsFullProject.summary.metadata.description
    );
  });

  it("should render project logo", async () => {
    const { container } = renderProjectInfoSection(mockSnsFullProject.summary);

    const element = container.querySelector("img") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.getAttribute("src")).toEqual(
      mockSnsFullProject.summary.metadata.logo
    );
  });

  it("should render token name", async () => {
    const { getByTestId } = renderProjectInfoSection(
      mockSnsFullProject.summary
    );

    const element = getByTestId(
      "sns-project-detail-info-token-name"
    ) as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.textContent).toEqual(mockSnsFullProject.summary.token.name);
  });

  it("should render token symbol", async () => {
    const { getByTestId } = renderProjectInfoSection(
      mockSnsFullProject.summary
    );

    const element = getByTestId(
      "sns-project-detail-info-token-symbol"
    ) as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.textContent).toEqual(
      mockSnsFullProject.summary.token.symbol
    );
  });
});
