import { ICP } from "@dfinity/nns";
import {
  SnsSwapLifecycle,
  type SnsSwapBuyerState,
  type SnsSwapTimeWindow,
} from "@dfinity/sns";
import type { SnsFullProject } from "../../../lib/stores/projects.store";
import type { SnsSwapCommitment } from "../../../lib/types/sns";
import { nowInSeconds } from "../../../lib/utils/date.utils";
import {
  canUserParticipateToSwap,
  durationTillSwapDeadline,
  durationTillSwapStart,
  filterActiveProjects,
  filterCommittedProjects,
  hasUserParticipatedToSwap,
  openTimeWindow,
  swapDuration,
  validParticipation,
} from "../../../lib/utils/projects.utils";
import {
  mockSnsFullProject,
  mockSnsSwapCommitment,
  mockSwap,
  mockSwapCommitment,
  mockSwapInit,
  principal,
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
        (mockSwap.state.open_time_window[0] as SnsSwapTimeWindow)
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
        (mockSwap.state.open_time_window[0] as SnsSwapTimeWindow)
          .end_timestamp_seconds -
          (mockSwap.state.open_time_window[0] as SnsSwapTimeWindow)
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
          (mockSwap.state.open_time_window[0] as SnsSwapTimeWindow)
            .start_timestamp_seconds
      ));
  });

  describe("time window", () => {
    it("should extract time window", () =>
      expect(openTimeWindow(mockSwap)).not.toBeUndefined());

    it("should not extract time window", () =>
      expect(
        openTimeWindow({
          ...mockSwap,
          state: {
            ...mockSwap.state,
            open_time_window: [],
          },
        })
      ).toBeUndefined());
  });

  describe("can user participate to swap", () => {
    it("cannot participate to swap if no summary or swap information", () => {
      expect(
        canUserParticipateToSwap({
          summary: undefined,
          swapCommitment: undefined,
        })
      ).toBeFalsy();
      expect(
        canUserParticipateToSwap({ summary: null, swapCommitment: undefined })
      ).toBeFalsy();
      expect(
        canUserParticipateToSwap({ summary: undefined, swapCommitment: null })
      ).toBeFalsy();
      expect(
        canUserParticipateToSwap({ summary: null, swapCommitment: null })
      ).toBeFalsy();
    });

    it("cannot participate to swap if sale is not open", () => {
      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Unspecified),
          swapCommitment: mockSwapCommitment,
        })
      ).toBeFalsy();

      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
          swapCommitment: mockSwapCommitment,
        })
      ).toBeFalsy();

      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
          swapCommitment: mockSwapCommitment,
        })
      ).toBeFalsy();

      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Aborted),
          swapCommitment: mockSwapCommitment,
        })
      ).toBeFalsy();
    });

    it("can participate to swap if sale is open", () => {
      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          swapCommitment: mockSwapCommitment,
        })
      ).toBeTruthy();
    });

    it("cannot participate to swap if max user commitment is reached", () => {
      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          swapCommitment: {
            rootCanisterId: mockSwapCommitment.rootCanisterId,
            myCommitment: {
              ...(mockSwapCommitment.myCommitment as SnsSwapBuyerState),
              amount_icp_e8s: mockSwapInit.max_participant_icp_e8s,
            },
          },
        })
      ).toBeFalsy();
    });

    it("can participate to swap if max user commitment is not reached", () => {
      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          swapCommitment: mockSwapCommitment,
        })
      ).toBeTruthy();
    });
  });

  describe("has user participated to swap", () => {
    it("should have participated to swap", () =>
      expect(
        hasUserParticipatedToSwap({
          swapCommitment: mockSwapCommitment,
        })
      ).toBeTruthy());

    it("should not have participated to swap", () => {
      expect(
        hasUserParticipatedToSwap({
          swapCommitment: undefined,
        })
      ).toBeFalsy();

      expect(
        hasUserParticipatedToSwap({
          swapCommitment: null,
        })
      ).toBeFalsy();

      expect(
        hasUserParticipatedToSwap({
          swapCommitment: mockSnsSwapCommitment(principal(3)),
        })
      ).toBeFalsy();

      expect(
        hasUserParticipatedToSwap({
          swapCommitment: {
            ...mockSwapCommitment,
            myCommitment: {
              ...(mockSwapCommitment.myCommitment as SnsSwapBuyerState),
              amount_icp_e8s: BigInt(0),
            },
          },
        })
      ).toBeFalsy();
    });
  });

  describe("validParticipation", () => {
    const validAmountE8s = BigInt(1_000_000_000);
    const validProject: SnsFullProject = {
      ...mockSnsFullProject,
      summary: {
        ...mockSnsFullProject.summary,
        swap: {
          ...mockSnsFullProject.summary.swap,
          state: {
            ...mockSnsFullProject.summary.swap.state,
            lifecycle: SnsSwapLifecycle.Open,
          },
          init: {
            ...mockSnsFullProject.summary.swap.init,
            min_participant_icp_e8s: validAmountE8s - BigInt(10_000),
            max_participant_icp_e8s: validAmountE8s + BigInt(10_000),
            max_icp_e8s: validAmountE8s + BigInt(10_000),
          },
        },
      },
      swapCommitment: {
        ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
        myCommitment: {
          ...(mockSnsFullProject.swapCommitment
            ?.myCommitment as SnsSwapBuyerState),
          amount_icp_e8s: BigInt(0),
        },
      },
    };
    it("returns true if valid participation", () => {
      const { valid } = validParticipation({
        project: validProject,
        amount: ICP.fromE8s(validAmountE8s),
      });
      expect(valid).toBe(true);
    });

    it("returns false if project committed", () => {
      const project = {
        ...validProject,
        summary: {
          ...validProject.summary,
          swap: {
            ...validProject.summary.swap,
            state: {
              ...validProject.summary.swap.state,
              lifecycle: SnsSwapLifecycle.Committed,
            },
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: ICP.fromE8s(validAmountE8s),
      });
      expect(valid).toBe(false);
    });

    it("returns false if project pending", () => {
      const project = {
        ...validProject,
        summary: {
          ...validProject.summary,
          swap: {
            ...validProject.summary.swap,
            state: {
              ...validProject.summary.swap.state,
              lifecycle: SnsSwapLifecycle.Pending,
            },
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: ICP.fromE8s(validAmountE8s),
      });
      expect(valid).toBe(false);
    });

    it("returns false if amount is larger than maximum per participant", () => {
      const project = {
        ...validProject,
        summary: {
          ...validProject.summary,
          swap: {
            ...validProject.summary.swap,
            init: {
              ...validProject.summary.swap.init,
              max_participant_icp_e8s: validAmountE8s,
            },
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: ICP.fromE8s(validAmountE8s + BigInt(10_000)),
      });
      expect(valid).toBe(false);
    });

    it("takes into account current participation to calculate the maximum per participant", () => {
      const project: SnsFullProject = {
        ...validProject,
        summary: {
          ...validProject.summary,
          swap: {
            ...validProject.summary.swap,
            init: {
              ...validProject.summary.swap.init,
              max_participant_icp_e8s: validAmountE8s * BigInt(2),
            },
          },
        },
        swapCommitment: {
          ...(validProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            ...(validProject.swapCommitment?.myCommitment as SnsSwapBuyerState),
            amount_icp_e8s: validAmountE8s,
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: ICP.fromE8s(validAmountE8s + BigInt(10_000)),
      });
      expect(valid).toBe(false);
    });
  });
});
