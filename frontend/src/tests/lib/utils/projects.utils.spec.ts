import { SnsSwapLifecycle } from "@dfinity/sns";
import {
  filterActiveProjects,
  filterCommittedProjects,
} from "../../../lib/utils/projects.utils";
import {
  mockSnsFullProject,
  mockSwap,
  summaryForLifecycle,
} from "../../mocks/sns-projects.mock";

describe("project-utils", () => {
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
