import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import * as summaryGetters from "$lib/getters/sns-summary";
import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import { nowInSeconds } from "$lib/utils/date.utils";
import {
  canUserParticipateToSwap,
  commitmentExceedsAmountLeft,
  currentUserMaxCommitment,
  durationTillSwapDeadline,
  durationTillSwapStart,
  filterActiveProjects,
  filterCommittedProjects,
  filterProjectsStatus,
  hasUserParticipatedToSwap,
  participateButtonStatus,
  projectRemainingAmount,
  userCountryIsNeeded,
  validParticipation,
} from "$lib/utils/projects.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  createTransferableAmount,
  mockSnsFullProject,
  mockSnsParams,
  mockSnsSwapCommitment,
  mockSwap,
  mockSwapCommitment,
  principal,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { SnsSwapLifecycle, type SnsSwapTicket } from "@dfinity/sns";

describe("project-utils", () => {
  describe("filter", () => {
    it("should filter by status", () => {
      expect(
        filterProjectsStatus({
          projects: [
            {
              ...mockSnsFullProject,
              summary: summaryForLifecycle(SnsSwapLifecycle.Open),
            },
            {
              ...mockSnsFullProject,
              summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
            },
          ],
          swapLifecycle: SnsSwapLifecycle.Open,
        })[0].summary.swap.lifecycle
      ).toEqual(SnsSwapLifecycle.Open);

      expect(
        filterProjectsStatus({
          projects: [
            {
              ...mockSnsFullProject,
              summary: summaryForLifecycle(SnsSwapLifecycle.Open),
            },
            {
              ...mockSnsFullProject,
              summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
            },
          ],
          swapLifecycle: SnsSwapLifecycle.Pending,
        })
      ).toEqual([]);
    });

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
                lifecycle: SnsSwapLifecycle.Pending,
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
            summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          },
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
          },
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Adopted),
          },
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Aborted),
          },
          {
            ...mockSnsFullProject,
            summary: summaryForLifecycle(SnsSwapLifecycle.Unspecified),
          },
        ])?.length
      ).toEqual(3);
    });
  });

  describe("durationTillSwapDeadline", () => {
    const now = Date.now();
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now);
    });

    afterAll(() => {
      jest.useRealTimers();
    });
    it("should return duration until swap deadline", () => {
      const dueSeconds = 3600;
      const dueTimestampSeconds = BigInt(nowInSeconds() + dueSeconds);
      const swap = {
        ...mockSwap,
        params: {
          ...mockSnsParams,
          swap_due_timestamp_seconds: dueTimestampSeconds,
        },
      };
      expect(durationTillSwapDeadline(swap)).toEqual(BigInt(dueSeconds));
    });
  });

  describe("durationTillSwapStart", () => {
    const now = Date.now();
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(now);
    });

    afterAll(() => {
      jest.useRealTimers();
    });
    it("should return duration until swap deadline", () => {
      const dueSeconds = 3600;
      const dueTimestampSeconds = BigInt(nowInSeconds() + dueSeconds);
      const swap = {
        ...mockSwap,
        decentralization_sale_open_timestamp_seconds: dueTimestampSeconds,
      };
      expect(durationTillSwapStart(swap)).toEqual(BigInt(dueSeconds));
    });
  });

  describe("can user participate to swap", () => {
    it("cannot participate to swap if no summary or swap information", () => {
      expect(
        canUserParticipateToSwap({
          summary: undefined,
          swapCommitment: undefined,
        })
      ).toBe(false);
      expect(
        canUserParticipateToSwap({ summary: null, swapCommitment: undefined })
      ).toBe(false);
      expect(
        canUserParticipateToSwap({ summary: undefined, swapCommitment: null })
      ).toBe(false);
      expect(
        canUserParticipateToSwap({ summary: null, swapCommitment: null })
      ).toBe(false);
    });

    it("cannot participate to swap if sale is not open", () => {
      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Unspecified),
          swapCommitment: mockSwapCommitment,
        })
      ).toBe(false);

      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
          swapCommitment: mockSwapCommitment,
        })
      ).toBe(false);

      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
          swapCommitment: mockSwapCommitment,
        })
      ).toBe(false);

      expect(
        canUserParticipateToSwap({
          summary: summaryForLifecycle(SnsSwapLifecycle.Aborted),
          swapCommitment: mockSwapCommitment,
        })
      ).toBe(false);
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
              icp: [
                createTransferableAmount(mockSnsParams.max_participant_icp_e8s),
              ],
            },
          },
        })
      ).toBe(false);
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

  describe("userCountryIsNeeded", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // TODO: GIX-1545 Remove mock and create a summary with deny list
      jest.spyOn(summaryGetters, "getDeniedCountries").mockReturnValue(["US"]);
    });

    it("country not needed", () => {
      expect(
        userCountryIsNeeded({
          summary: undefined,
          swapCommitment: undefined,
          loggedIn: true,
        })
      ).toBe(false);
      expect(
        userCountryIsNeeded({
          summary: null,
          swapCommitment: undefined,
          loggedIn: true,
        })
      ).toBe(false);
      expect(
        userCountryIsNeeded({
          summary: undefined,
          swapCommitment: null,
          loggedIn: true,
        })
      ).toBe(false);
      expect(
        userCountryIsNeeded({
          summary: null,
          swapCommitment: null,
          loggedIn: true,
        })
      ).toBe(false);
    });

    it("country not needed if sale is not open", () => {
      expect(
        userCountryIsNeeded({
          summary: summaryForLifecycle(SnsSwapLifecycle.Unspecified),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);

      expect(
        userCountryIsNeeded({
          summary: summaryForLifecycle(SnsSwapLifecycle.Pending),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);

      expect(
        userCountryIsNeeded({
          summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);

      expect(
        userCountryIsNeeded({
          summary: summaryForLifecycle(SnsSwapLifecycle.Aborted),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);
    });

    it("country is needed", () => {
      expect(
        userCountryIsNeeded({
          summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(true);
    });

    it("country not needed if empty list of denied countries", () => {
      // TODO: GIX-1545 Remove mock and create a summary with deny list
      jest.spyOn(summaryGetters, "getDeniedCountries").mockReturnValue([]);
      expect(
        userCountryIsNeeded({
          summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);
    });

    it("country not needed if not logged in", () => {
      expect(
        userCountryIsNeeded({
          summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          swapCommitment: mockSwapCommitment,
          loggedIn: false,
        })
      ).toBe(false);
    });

    it("country is not needed if max user commitment is reached", () => {
      expect(
        userCountryIsNeeded({
          summary: summaryForLifecycle(SnsSwapLifecycle.Open),
          swapCommitment: {
            rootCanisterId: mockSwapCommitment.rootCanisterId,
            myCommitment: {
              icp: [
                createTransferableAmount(mockSnsParams.max_participant_icp_e8s),
              ],
            },
          },
          loggedIn: true,
        })
      ).toBe(false);
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
      ).toBe(false);

      expect(
        hasUserParticipatedToSwap({
          swapCommitment: null,
        })
      ).toBe(false);

      expect(
        hasUserParticipatedToSwap({
          swapCommitment: mockSnsSwapCommitment(principal(3)),
        })
      ).toBe(false);

      expect(
        hasUserParticipatedToSwap({
          swapCommitment: {
            ...mockSwapCommitment,
            myCommitment: {
              icp: [],
            },
          },
        })
      ).toBe(false);
    });
  });

  describe("currentUserMaxCommitment", () => {
    it("returns the user maximum when no participation yet", () => {
      const projectMax = BigInt(10_000_000_000);
      const userMax = BigInt(1_000_000_000);
      const validProject: SnsFullProject = {
        ...mockSnsFullProject,
        summary: {
          ...mockSnsFullProject.summary,
          derived: {
            buyer_total_icp_e8s: BigInt(0),
            sns_tokens_per_icp: 1,
          },
          swap: {
            ...mockSnsFullProject.summary.swap,
            params: {
              ...mockSnsFullProject.summary.swap.params,
              min_participant_icp_e8s: BigInt(100_000_000),
              max_participant_icp_e8s: userMax,
              max_icp_e8s: projectMax,
            },
          },
        },
        swapCommitment: undefined,
      };
      expect(currentUserMaxCommitment(validProject)).toEqual(userMax);
    });

    it("returns the remainder to the user maximum if already participated", () => {
      const projectMax = BigInt(10_000_000_000);
      const userMax = BigInt(1_000_000_000);
      const userCommitment = BigInt(400_000_000);
      const validProject: SnsFullProject = {
        ...mockSnsFullProject,
        summary: {
          ...mockSnsFullProject.summary,
          derived: {
            buyer_total_icp_e8s: userCommitment,
            sns_tokens_per_icp: 1,
          },
          swap: {
            ...mockSnsFullProject.summary.swap,
            params: {
              ...mockSnsFullProject.summary.swap.params,
              min_participant_icp_e8s: BigInt(100_000_000),
              max_participant_icp_e8s: userMax,
              max_icp_e8s: projectMax,
            },
          },
        },
        swapCommitment: {
          ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            icp: [createTransferableAmount(userCommitment)],
          },
        },
      };
      expect(currentUserMaxCommitment(validProject)).toEqual(
        userMax - userCommitment
      );
    });

    it("returns the remainder to the project maximum if remainder lower than user max", () => {
      const projectMax = BigInt(10_000_000_000);
      const userMax = BigInt(1_000_000_000);
      const projectCommitment = BigInt(9_500_000_000);
      const validProject: SnsFullProject = {
        ...mockSnsFullProject,
        summary: {
          ...mockSnsFullProject.summary,
          derived: {
            buyer_total_icp_e8s: projectCommitment,
            sns_tokens_per_icp: 1,
          },
          swap: {
            ...mockSnsFullProject.summary.swap,
            params: {
              ...mockSnsFullProject.summary.swap.params,
              min_participant_icp_e8s: BigInt(100_000_000),
              max_participant_icp_e8s: userMax,
              max_icp_e8s: projectMax,
            },
          },
        },
        swapCommitment: undefined,
      };
      expect(currentUserMaxCommitment(validProject)).toEqual(
        projectMax - projectCommitment
      );
    });

    it("returns the remainder to the user maximum even when current commitment minus max is lower than maximum per user", () => {
      const projectMax = BigInt(10_000_000_000);
      const userMax = BigInt(1_000_000_000);
      const projectCommitment = BigInt(9_200_000_000);
      const userCommitment = BigInt(400_000_000);
      const validProject: SnsFullProject = {
        ...mockSnsFullProject,
        summary: {
          ...mockSnsFullProject.summary,
          derived: {
            buyer_total_icp_e8s: projectCommitment,
            sns_tokens_per_icp: 1,
          },
          swap: {
            ...mockSnsFullProject.summary.swap,
            params: {
              ...mockSnsFullProject.summary.swap.params,
              min_participant_icp_e8s: BigInt(100_000_000),
              max_participant_icp_e8s: userMax,
              max_icp_e8s: projectMax,
            },
          },
        },
        swapCommitment: {
          ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            icp: [createTransferableAmount(userCommitment)],
          },
        },
      };
      expect(currentUserMaxCommitment(validProject)).toEqual(
        userMax - userCommitment
      );
    });
  });

  describe("projectRemainingAmount", () => {
    it("returns remaining amount taking into account current commitment", () => {
      const projectMax = BigInt(10_000_000_000);
      const projectCommitment = BigInt(9_200_000_000);
      const summary: SnsSummary = {
        ...mockSnsFullProject.summary,
        derived: {
          buyer_total_icp_e8s: projectCommitment,
          sns_tokens_per_icp: 1,
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            min_participant_icp_e8s: BigInt(100_000_000),
            max_participant_icp_e8s: BigInt(1_000_000_000),
            max_icp_e8s: projectMax,
          },
        },
      };
      expect(projectRemainingAmount(summary)).toEqual(
        projectMax - projectCommitment
      );
    });
  });

  describe("validParticipation", () => {
    const validAmountE8s = BigInt(1_000_000_000);
    const validProject: SnsFullProject = {
      ...mockSnsFullProject,
      summary: {
        ...mockSnsFullProject.summary,
        derived: {
          buyer_total_icp_e8s: BigInt(0),
          sns_tokens_per_icp: 1,
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          lifecycle: SnsSwapLifecycle.Open,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            min_participant_icp_e8s: validAmountE8s - BigInt(10_000),
            max_participant_icp_e8s: validAmountE8s + BigInt(10_000),
            max_icp_e8s: validAmountE8s + BigInt(10_000),
          },
        },
      },
      swapCommitment: {
        ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
        myCommitment: {
          icp: [createTransferableAmount(BigInt(0))],
        },
      },
    };
    it("returns true if valid participation", () => {
      const { valid } = validParticipation({
        project: validProject,
        amount: TokenAmount.fromE8s({
          amount: validAmountE8s,
          token: ICPToken,
        }),
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
            lifecycle: SnsSwapLifecycle.Committed,
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: validAmountE8s,
          token: ICPToken,
        }),
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
            lifecycle: SnsSwapLifecycle.Pending,
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: validAmountE8s,
          token: ICPToken,
        }),
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
            params: {
              ...validProject.summary.swap.params,
              max_participant_icp_e8s: validAmountE8s,
            },
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: validAmountE8s + BigInt(10_000),
          token: ICPToken,
        }),
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
            params: {
              ...validProject.summary.swap.params,
              max_participant_icp_e8s: validAmountE8s * BigInt(2),
            },
          },
        },
        swapCommitment: {
          ...(validProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            icp: [createTransferableAmount(validAmountE8s)],
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: validAmountE8s + BigInt(10_000),
          token: ICPToken,
        }),
      });
      expect(valid).toBe(false);
    });

    it("returns false if amount is larger than project remainder to get to maximum", () => {
      const maxE8s = BigInt(1_000_000_000);
      const participationE8s = BigInt(100_000_000);
      const currentE8s = BigInt(950_000_000);
      const project: SnsFullProject = {
        ...validProject,
        summary: {
          ...validProject.summary,
          derived: {
            buyer_total_icp_e8s: currentE8s,
            sns_tokens_per_icp: 1,
          },
          swap: {
            ...validProject.summary.swap,
            params: {
              ...validProject.summary.swap.params,
              max_participant_icp_e8s: maxE8s,
            },
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: participationE8s,
          token: ICPToken,
        }),
      });
      expect(valid).toBe(false);
    });

    it("returns false if amount is smaller than project remainder to get to maximum, but larger than user remainder until max", () => {
      const maxProject = BigInt(100_000_000_000);
      const minPerUser = BigInt(100_000_000);
      const maxPerUser = BigInt(2_000_000_000);
      const currentProjectParticipation = BigInt(99_500_000_000);
      const currentUserParticipation = BigInt(800_000_000);
      const newParticipation = BigInt(600_000_000);
      const project: SnsFullProject = {
        ...validProject,
        summary: {
          ...validProject.summary,
          derived: {
            buyer_total_icp_e8s: currentProjectParticipation,
            sns_tokens_per_icp: 1,
          },
          swap: {
            ...validProject.summary.swap,
            params: {
              ...validProject.summary.swap.params,
              max_participant_icp_e8s: maxPerUser,
              min_participant_icp_e8s: minPerUser,
              max_icp_e8s: maxProject,
            },
          },
        },
        swapCommitment: {
          ...(validProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            icp: [createTransferableAmount(currentUserParticipation)],
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: newParticipation,
          token: ICPToken,
        }),
      });
      expect(valid).toBe(false);
    });
  });

  describe("validParticipation", () => {
    const maxProject = BigInt(100_000_000_000);
    const minPerUser = BigInt(100_000_000);
    const maxPerUser = BigInt(2_000_000_000);
    const project: SnsFullProject = {
      ...mockSnsFullProject,
      summary: {
        ...mockSnsFullProject.summary,
        derived: {
          buyer_total_icp_e8s: BigInt(0),
          sns_tokens_per_icp: 1,
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          lifecycle: SnsSwapLifecycle.Open,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            min_participant_icp_e8s: minPerUser,
            max_participant_icp_e8s: maxPerUser,
            max_icp_e8s: maxProject,
          },
        },
      },
      swapCommitment: undefined,
    };
    it("user flow check", () => {
      // User can participate if amount is min per user;
      const initialAmountUser = minPerUser;
      const { valid: v1 } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: initialAmountUser,
          token: ICPToken,
        }),
      });
      expect(v1).toBe(true);

      // Increase user participation
      project.swapCommitment = {
        ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
        myCommitment: {
          icp: [createTransferableAmount(initialAmountUser)],
        },
      };

      // User can participate with amount less than min
      const secondAmountUser = BigInt(10);
      const { valid: v2 } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: secondAmountUser,
          token: ICPToken,
        }),
      });
      expect(v2).toBe(true);

      // User can't participate if amount is greater than max per user
      const { valid: v3 } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: maxPerUser,
          token: ICPToken,
        }),
      });
      expect(v3).toBe(false);

      // User can participate to user max
      const { valid: v4 } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: maxPerUser - initialAmountUser,
          token: ICPToken,
        }),
      });
      expect(v4).toBe(true);

      // Increase project participation until the user can't participate with max per user
      project.summary.derived.buyer_total_icp_e8s = maxProject - minPerUser;

      // User can't participate to user max
      const { valid: v5 } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: maxPerUser - initialAmountUser,
          token: ICPToken,
        }),
      });
      expect(v5).toBe(false);

      // User can participate to project max
      const { valid: v6 } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: maxProject - project.summary.derived.buyer_total_icp_e8s,
          token: ICPToken,
        }),
      });
      expect(v6).toBe(true);

      // User can't participate to above project max
      const { valid: v7 } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: maxPerUser - initialAmountUser + BigInt(10_000),
          token: ICPToken,
        }),
      });
      expect(v7).toBe(false);
    });
  });

  describe("commitmentExceedsAmountLeft", () => {
    it("returns true if amount is larger than maximum left", () => {
      const maxE8s = BigInt(1_000_000_000);
      const participationE8s = BigInt(100_000_000);
      const currentE8s = BigInt(950_000_000);
      const summary: SnsSummary = {
        ...mockSnsFullProject.summary,
        derived: {
          buyer_total_icp_e8s: currentE8s,
          sns_tokens_per_icp: 1,
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            max_icp_e8s: maxE8s,
          },
        },
      };
      const expected = commitmentExceedsAmountLeft({
        summary,
        amountE8s: participationE8s,
      });
      expect(expected).toBe(true);
    });

    it("returns false if amount is smaller than maximum left", () => {
      const maxE8s = BigInt(1_000_000_000);
      const participationE8s = BigInt(100_000_000);
      const currentE8s = BigInt(850_000_000);
      const summary: SnsSummary = {
        ...mockSnsFullProject.summary,
        derived: {
          buyer_total_icp_e8s: currentE8s,
          sns_tokens_per_icp: 1,
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            max_icp_e8s: maxE8s,
          },
        },
      };
      const expected = commitmentExceedsAmountLeft({
        summary,
        amountE8s: participationE8s,
      });
      expect(expected).toBe(false);
    });
  });

  describe.only("participateButtonStatus", () => {
    const summary: SnsSummary = {
      ...mockSnsFullProject.summary,
    };

    const notOpenSummary: SnsSummary = {
      ...mockSnsFullProject.summary,
      swap: {
        ...mockSnsFullProject.summary.swap,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    };

    const userNoCommitment: SnsSwapCommitment = {
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      myCommitment: undefined,
    };

    const testTicket: SnsSwapTicket = {
      creation_time: BigInt(nowInSeconds()),
      ticket_id: 123n,
      account: [
        {
          owner: [mockPrincipal],
          subaccount: [],
        },
      ],
      amount_icp_e8s: BigInt(1000_000_000),
    };

    it("returns 'logged-out' if user is not logged in", () => {
      const expected = participateButtonStatus({
        loggedIn: false,
        summary,
        swapCommitment: userNoCommitment,
        userCountry: undefined,
        ticket: null,
      });
      expect(expected).toBe("logged-out");
    });

    it("returns 'loading' if summary or swap are still fetching", () => {
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: undefined,
          userCountry: "CH",
          ticket: null,
        })
      ).toBe("loading");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: null,
          userCountry: "CH",
          ticket: null,
        })
      ).toBe("loading");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary: null,
          swapCommitment: userNoCommitment,
          userCountry: "CH",
          ticket: null,
        })
      ).toBe("loading");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary: undefined,
          swapCommitment: userNoCommitment,
          userCountry: "CH",
          ticket: null,
        })
      ).toBe("loading");
    });

    it("returns 'loading' if ticket is still fetching or it's open", () => {
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: userNoCommitment,
          userCountry: "CH",
          ticket: undefined,
        })
      ).toBe("loading");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: userNoCommitment,
          userCountry: "CH",
          ticket: testTicket,
        })
      ).toBe("loading");
    });

    it("returns 'disabled-no-open' if project is not open", () => {
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary: notOpenSummary,
          swapCommitment: userNoCommitment,
          userCountry: "CH",
          ticket: null,
        })
      ).toBe("disabled-no-open");
    });

    it("returns 'disabled-max-participation' if user already participated with max amount", () => {
      const userMaxCommitment: SnsSwapCommitment = {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        myCommitment: {
          icp: [
            createTransferableAmount(
              summary.swap.params.max_participant_icp_e8s + BigInt(1)
            ),
          ],
        },
      };
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: userMaxCommitment,
          userCountry: "CH",
          ticket: null,
        })
      ).toBe("disabled-max-participation");
    });

    it("returns 'enabled' if there are no restricted countries", () => {
      // TODO: GIX-1545 Remove mock and create a summary with empty deny list
      jest.spyOn(summaryGetters, "getDeniedCountries").mockReturnValue([]);
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: userNoCommitment,
          userCountry: undefined,
          ticket: null,
        })
      ).toBe("enabled");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: userNoCommitment,
          userCountry: new Error("Failed to get user country"),
          ticket: null,
        })
      ).toBe("enabled");
    });

    describe("when project has a restricted countries list", () => {
      beforeEach(() => {
        // TODO: GIX-1545 Remove mock and create a summary with deny list
        jest
          .spyOn(summaryGetters, "getDeniedCountries")
          .mockReturnValue(["CH"]);
      });

      it("returns 'disabled-no-eligible' if user is in a restricted country", () => {
        expect(
          participateButtonStatus({
            loggedIn: true,
            summary,
            swapCommitment: userNoCommitment,
            userCountry: "CH",
            ticket: null,
          })
        ).toBe("disabled-no-eligible");
      });

      it("returns 'loading' if no user country but restricted list is not empty", () => {
        expect(
          participateButtonStatus({
            loggedIn: true,
            summary,
            swapCommitment: userNoCommitment,
            userCountry: undefined,
            ticket: null,
          })
        ).toBe("loading");
      });

      it("returns 'enabled' if it fails to get the user country", () => {
        expect(
          participateButtonStatus({
            loggedIn: true,
            summary,
            swapCommitment: userNoCommitment,
            userCountry: new Error("Failed to get user country"),
            ticket: null,
          })
        ).toBe("enabled");
      });

      it("returns 'enabled' if user is NOT in a restricted country", () => {
        expect(
          participateButtonStatus({
            loggedIn: true,
            summary,
            swapCommitment: userNoCommitment,
            userCountry: "SP",
            ticket: null,
          })
        ).toBe("enabled");
      });
    });
  });
});
