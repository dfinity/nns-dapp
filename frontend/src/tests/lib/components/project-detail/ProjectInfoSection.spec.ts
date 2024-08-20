import ProjectInfoSection from "$lib/components/project-detail/ProjectInfoSection.svelte";
import {
  PROJECT_DETAIL_CONTEXT_KEY,
  type ProjectDetailContext,
  type ProjectDetailStore,
} from "$lib/types/project-detail.context";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import ContextWrapperTest from "$tests/lib/components/ContextWrapperTest.svelte";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";

describe("ProjectInfoSection", () => {
  const renderProjectInfoSection = (summary: SnsSummaryWrapper | undefined) =>
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

  it("should not render content if the summary is not yet defined", async () => {
    const { getByTestId } = renderProjectInfoSection(undefined);
    const call = () => getByTestId("sns-project-detail-info");
    expect(call).toThrow();
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
