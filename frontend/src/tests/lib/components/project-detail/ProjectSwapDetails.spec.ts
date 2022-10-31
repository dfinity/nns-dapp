/**
 * @jest-environment jsdom
 */

import ProjectSwapDetails from "$lib/components/project-detail/ProjectSwapDetails.svelte";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { secondsToDate, secondsToTime } from "$lib/utils/date.utils";
import {
  mockSnsFullProject,
  mockSnsParams,
  mockSummary,
} from "../../../mocks/sns-projects.mock";
import { renderContextCmp } from "../../../mocks/sns.mock";

describe("ProjectSwapDetails", () => {
  it("should render total tokens", () => {
    const { container } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectSwapDetails,
    });

    const element = Array.from(
      container.querySelectorAll('[data-tid="token-value"]')
    )[0];

    expect(element?.innerHTML).toEqual(
      `${(Number(mockSnsParams.sns_token_e8s) / 100000000).toFixed(2)}`
    );
  });

  it("should render min commitment", () => {
    const { container } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectSwapDetails,
    });

    const element = Array.from(
      container.querySelectorAll('[data-tid="token-value"]')
    )[1];

    expect(element?.innerHTML).toEqual(
      `${(Number(mockSnsParams.min_participant_icp_e8s) / 100000000).toFixed(
        2
      )}`
    );
  });

  it("should render max commitment", () => {
    const { container } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectSwapDetails,
    });

    const element = Array.from(
      container.querySelectorAll('[data-tid="token-value"]')
    )[2];

    expect(element?.innerHTML).toEqual(
      `${(Number(mockSnsParams.max_participant_icp_e8s) / 100000000).toFixed(
        2
      )}`
    );
  });

  it("should render sale end", () => {
    const { queryByTestId } = renderContextCmp({
      summary: mockSummary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectSwapDetails,
    });

    const element = queryByTestId("date-seconds");

    const seconds = Number(
      mockSnsFullProject.summary.swap.params.swap_due_timestamp_seconds
    );
    expect(element?.innerHTML).toEqual(
      `${secondsToDate(seconds)} ${secondsToTime(seconds)}`
    );
  });
});
