import { SnsSwapLifecycle } from "@dfinity/sns";
import type { TimeWindow } from "@dfinity/sns/dist/candid/sns_swap";
import { nowInSeconds } from "../../../lib/utils/date.utils";
import {
  durationTillSwapDeadline,
  durationTillSwapStart,
  filterActiveProjects,
  filterCommittedProjects,
  swapDuration,
} from "../../../lib/utils/projects.utils";
import {
  mockSnsFullProject,
  mockSwap,
  summaryForLifecycle,
} from "../../mocks/sns-projects.mock";

describe("project-utils", () => {
  describe("filter", () => {
    it("should return no committed projects", () =>
      expect(
        filterCommittedProjects([
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          },
        ])?.length
      ).toEqual(0));

    it("should return committed projects", () =>
      expect(
        filterCommittedProjects([
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          },
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
          },
        ])?.length
      ).toEqual(1));

    it("should return no active / launchpad projects", () => {
      expect(
        filterActiveProjects([
          {
            ...mockSnsFullProject,
            summary: {
              ...mockSnsFullProject.summary,
              swap: {
                ...mockSwap,
                state: {
                  ...mockSwap.state,
                  lifecycle: SnsSwapLifecycle.Pending,
                  open_time_window: [],
                },
              },
            },
          },
        ])?.length
      ).toEqual(0);

      expect(
        filterActiveProjects([
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Unspecified),
          },
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Aborted),
          },
        ])?.length
      ).toEqual(0);
    });

    it("should return active / launchpad projects", () => {
      expect(
        filterActiveProjects([
          {
            ...mockSnsFullProject,
            summary: {
              ...mockSnsFullProject.summary,
              swap: {
                ...mockSwap,
                state: {
                  ...mockSwap.state,
                  lifecycle: SnsSwapLifecycle.Pending,
                  open_time_window: [
                    {
                      start_timestamp_seconds: BigInt(1),
                      end_timestamp_seconds: BigInt(2),
                    },
                  ],
                },
              },
            },
          },
        ])?.length
      ).toEqual(1);

      expect(
        filterActiveProjects([
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          },
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
          },
        ])?.length
      ).toEqual(2);
    });
  });

  describe("deadline", () => {
    it("should return no duration until swap deadline", () =>
      expect(
        durationTillSwapDeadline({
          ...mockSwap,
          state: {
            ...mockSwap.state,
            open_time_window: [],
          },
        })
      ).toBeUndefined());

    it("should return duration until swap deadline", () =>
      expect(durationTillSwapDeadline(mockSwap)).toEqual(
        (mockSwap.state.open_time_window[0] as TimeWindow)
          .end_timestamp_seconds - BigInt(nowInSeconds())
      ));

    it("should return no swap duration", () =>
      expect(
        swapDuration({
          ...mockSwap,
          state: {
            ...mockSwap.state,
            open_time_window: [],
          },
        })
      ).toBeUndefined());

    it("should return swap duration", () =>
      expect(swapDuration(mockSwap)).toEqual(
        (mockSwap.state.open_time_window[0] as TimeWindow)
          .end_timestamp_seconds -
          (mockSwap.state.open_time_window[0] as TimeWindow)
            .start_timestamp_seconds
      ));

    it("should return no duration till swap", () =>
      expect(
        durationTillSwapStart({
          ...mockSwap,
          state: {
            ...mockSwap.state,
            open_time_window: [],
          },
        })
      ).toBeUndefined());

    it("should return duration till swap", () =>
      expect(durationTillSwapStart(mockSwap)).toEqual(
        BigInt(nowInSeconds()) -
          (mockSwap.state.open_time_window[0] as TimeWindow)
            .start_timestamp_seconds
      ));
  });
});
