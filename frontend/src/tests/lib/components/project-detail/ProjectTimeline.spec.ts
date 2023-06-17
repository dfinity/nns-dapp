/**
 * @jest-environment jsdom
 */

import ProjectTimeline from "$lib/components/project-detail/ProjectTimeline.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { secondsToDuration } from "$lib/utils/date.utils";
import {
  durationTillSwapDeadline,
  durationTillSwapStart,
} from "$lib/utils/projects.utils";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";

describe("ProjectTimeline", () => {
  const now = Date.now();
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should render deadline if status Open", () => {
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

  it("should render starting info if status Adopted", () => {
    const summaryData = summaryForLifecycle(SnsSwapLifecycle.Adopted);
    const summary = {
      ...summaryData,
      swap: {
        ...summaryData.swap,
        decentralization_sale_open_timestamp_seconds: BigInt(
          now + SECONDS_IN_DAY
        ),
      },
    };
    const { queryByText } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectTimeline,
    });
    expect(queryByText(en.sns_project_detail.starts)).toBeInTheDocument();

    const expectedStartingInfo = secondsToDuration(
      durationTillSwapStart(summary.swap)
    );
    expect(queryByText(expectedStartingInfo)).toBeInTheDocument();
  });
});
