/**
 * @jest-environment jsdom
 */

import { SnsSwapLifecycle } from "@dfinity/sns";
import ProjectCommitment from "../../../../lib/components/project-detail/ProjectCommitment.svelte";
import type { SnsSwapCommitment } from "../../../../lib/types/sns";
import { formatToken } from "../../../../lib/utils/icp.utils";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsFullProject,
  summaryForLifecycle,
} from "../../../mocks/sns-projects.mock";
import { renderContextCmp } from "../../../mocks/sns.mock";

describe("ProjectCommitment", () => {
  const summary = summaryForLifecycle(SnsSwapLifecycle.Open);

  it("should render min and max commitment", () => {
    const { queryByTestId } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });
    expect(
      queryByTestId("commitment-max-indicator-value")?.textContent
    ).toEqual(`${formatToken({ value: summary.swap.init.max_icp_e8s })} ICP`);
    expect(
      queryByTestId("commitment-min-indicator-value")?.textContent
    ).toEqual(`${formatToken({ value: summary.swap.init.min_icp_e8s })} ICP`);
  });

  it("should render overall current commitment", () => {
    const { queryByTestId } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });
    expect(
      queryByTestId("sns-project-current-commitment")?.textContent
    ).toEqual(
      `${en.sns_project_detail.current_overall_commitment} ${formatToken({
        value: summary.derived.buyer_total_icp_e8s,
      })} ICP`
    );
  });
});
