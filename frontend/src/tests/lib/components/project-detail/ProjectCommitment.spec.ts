/**
 * @jest-environment jsdom
 */

import ProjectCommitment from "$lib/components/project-detail/ProjectCommitment.svelte";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { formatToken } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";

describe("ProjectCommitment", () => {
  const summary = summaryForLifecycle(SnsSwapLifecycle.Open);

  it("should render min and max commitment", () => {
    const { queryByTestId } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });
    expect(
      queryByTestId("commitment-max-indicator-value")?.textContent.trim()
    ).toEqual(`${formatToken({ value: summary.swap.params.max_icp_e8s })} ICP`);
    expect(
      queryByTestId("commitment-min-indicator-value")?.textContent.trim()
    ).toEqual(`${formatToken({ value: summary.swap.params.min_icp_e8s })} ICP`);
  });

  it("should render overall current commitment", () => {
    const { queryByTestId } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });

    const textContent: string =
      queryByTestId("sns-project-current-commitment")?.textContent ?? "";

    expect(
      textContent.includes(en.sns_project_detail.current_overall_commitment)
    ).toBeTruthy();

    expect(
      textContent.includes(
        `${formatToken({ value: summary.derived.buyer_total_icp_e8s })} ICP`
      )
    ).toBeTruthy();
  });
});
