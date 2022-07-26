/**
 * @jest-environment jsdom
 */

import { SnsSwapLifecycle } from "@dfinity/sns";
import ProjectTimeline from "../../../../lib/components/project-detail/ProjectTimeline.svelte";
import type { SnsSwapCommitment } from "../../../../lib/types/sns";
import { secondsToDuration } from "../../../../lib/utils/date.utils";
import { durationTillSwapDeadline } from "../../../../lib/utils/projects.utils";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsFullProject,
  mockSwap,
  summaryForLifecycle,
} from "../../../mocks/sns-projects.mock";
import { renderContextCmp } from "../../../mocks/sns.mock";

describe("ProjectTimeline", () => {
  it("should render no timeline", () => {
    const { queryByText } = renderContextCmp({
      summary: {
        ...mockSnsFullProject.summary,
        swap: {
          ...mockSwap,
          state: {
            ...mockSwap.state,
            lifecycle: SnsSwapLifecycle.Open,
            open_time_window: [],
          },
        },
      },
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectTimeline,
    });
    expect(queryByText(en.sns_project_detail.deadline)).not.toBeInTheDocument();
  });

  it("should render timeline", () => {
    const summary = summaryForLifecycle(SnsSwapLifecycle.Open);
    const { queryByText } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectTimeline,
    });
    expect(queryByText(en.sns_project_detail.deadline)).toBeInTheDocument();

    const expectedDeadline = secondsToDuration(
      durationTillSwapDeadline(summary.swap) as bigint
    );
    expect(queryByText(expectedDeadline)).toBeInTheDocument();
  });

  it("should render a progress component", () => {
    const { container } = renderContextCmp({
      summary: summaryForLifecycle(SnsSwapLifecycle.Open),
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectTimeline,
    });
    expect(container.querySelector("progress")).not.toBeNull();
  });
});
