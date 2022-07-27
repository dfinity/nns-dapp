/**
 * @jest-environment jsdom
 */

import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import ProjectCardSwapInfo from "../../../../lib/components/launchpad/ProjectCardSwapInfo.svelte";
import { secondsToDuration } from "../../../../lib/utils/date.utils";
import { formatICP } from "../../../../lib/utils/icp.utils";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsFullProject,
  mockSummary,
  mockSwap,
  mockSwapState,
  mockSwapTimeWindow,
  mockSwapTimeWindowText,
  summaryForLifecycle,
} from "../../../mocks/sns-projects.mock";

jest.mock("../../../../lib/services/sns.services", () => {
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
      mockSwapTimeWindow.end_timestamp_seconds -
      BigInt(Math.round(Date.now() / 1000));

    expect(
      getByText(secondsToDuration(durationTillDeadline))
    ).toBeInTheDocument();
  });

  it("should render no deadline if no deadline", () => {
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project: {
          ...mockSnsFullProject,
          summary: {
            ...mockSummary,
            swap: {
              ...mockSwap,
              state: {
                ...mockSwapState,
                open_time_window: [],
              },
            },
          },
        },
      },
    });

    const durationTillDeadline =
      mockSwapTimeWindow.end_timestamp_seconds -
      BigInt(Math.round(Date.now() / 1000));

    const call = () => getByText(secondsToDuration(durationTillDeadline));
    expect(call).toThrow();

    const call2 = () => getByText(en.sns_project_detail.deadline);
    expect(call2).toThrow();
  });

  it("should render my commitment", () => {
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const icpValue = formatICP({
      value: mockSnsFullProject.swapCommitment?.myCommitment
        ?.amount_icp_e8s as bigint,
    });

    expect(getByText(icpValue, { exact: false })).toBeInTheDocument();
  });

  it("should render sale start", () => {
    const { container } = render(ProjectCardSwapInfo, {
      props: {
        project: {
          ...mockSnsFullProject,
          summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
        },
      },
    });

    const element = container.querySelector(
      '[data-tid="date-seconds"]'
    ) as HTMLElement;

    expect(element.innerHTML).toEqual(
      mockSwapTimeWindowText.start_timestamp_seconds
    );
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
