/**
 * @jest-environment jsdom
 */

import ProjectCardSwapInfo from "$lib/components/launchpad/ProjectCardSwapInfo.svelte";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { secondsToDuration } from "$lib/utils/date.utils";
import { formatToken } from "$lib/utils/icp.utils";
import { getCommitmentE8s } from "$lib/utils/sns.utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsFullProject,
  summaryForLifecycle,
} from "../../../mocks/sns-projects.mock";

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSummaries: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSummary: jest.fn().mockResolvedValue(Promise.resolve()),
    loadSnsSwapStateStore: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("ProjectCardSwapInfo", () => {
  it("should render deadline", () => {
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const durationTillDeadline =
      mockSnsFullProject.summary.swap.params.swap_due_timestamp_seconds -
      BigInt(Math.round(Date.now() / 1000));

    expect(
      getByText(secondsToDuration(durationTillDeadline))
    ).toBeInTheDocument();
  });

  it("should render my commitment", () => {
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const icpValue = formatToken({
      value:
        getCommitmentE8s(
          mockSnsFullProject.swapCommitment as SnsSwapCommitment
        ) ?? BigInt(0),
    });

    expect(getByText(icpValue, { exact: false })).toBeInTheDocument();
  });

  it("should render completed", () => {
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project: {
          ...mockSnsFullProject,
          summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
        },
      },
    });

    expect(getByText(en.sns_project_detail.completed)).toBeInTheDocument();
  });
});
