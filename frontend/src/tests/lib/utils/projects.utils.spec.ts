import { NOT_LOADED } from "$lib/constants/stores.constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import type { SnsSwapCommitment } from "$lib/types/sns";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import { nowInSeconds } from "$lib/utils/date.utils";
import {
  canUserParticipateToSwap,
  commitmentExceedsAmountLeft,
  currentUserMaxCommitment,
  differentSummaries,
  durationTillSwapDeadline,
  durationTillSwapStart,
  filterActiveProjects,
  filterCommittedProjects,
  filterProjectsStatus,
  getProjectCommitmentSplit,
  hasUserParticipatedToSwap,
  participateButtonStatus,
  projectRemainingAmount,
  snsProjectDashboardUrl,
  userCountryIsNeeded,
  validParticipation,
} from "$lib/utils/projects.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  createSummary,
  createTransferableAmount,
  mockSnsFullProject,
  mockSnsParams,
  mockSnsSwapCommitment,
  mockSwap,
  mockSwapCommitment,
  principal,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle, type SnsSwapTicket } from "@dfinity/sns";
import { ICPToken, TokenAmount } from "@dfinity/utils";

describe("project-utils", () => {
  const summaryUsRestricted: SnsSummaryWrapper = createSummary({
    lifecycle: SnsSwapLifecycle.Open,
    restrictedCountries: ["US"],
  });
  const summaryNoRestricted: SnsSummaryWrapper = createSummary({
    lifecycle: SnsSwapLifecycle.Open,
    restrictedCountries: [],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

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
        })[0].summary.getLifecycle()
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
            summary: mockSnsFullProject.summary.overrideLifecycle(
              SnsSwapLifecycle.Pending
            ),
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
      vi.useFakeTimers().setSystemTime(now);
    });

    afterAll(() => {
      vi.useRealTimers();
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
      vi.useFakeTimers().setSystemTime(now);
    });

    afterAll(() => {
      vi.useRealTimers();
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
              has_created_neuron_recipes: [],
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
      vi.clearAllMocks();
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
          summary: createSummary({
            lifecycle: SnsSwapLifecycle.Unspecified,
            restrictedCountries: ["US"],
          }),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);

      expect(
        userCountryIsNeeded({
          summary: createSummary({
            lifecycle: SnsSwapLifecycle.Pending,
            restrictedCountries: ["US"],
          }),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);

      expect(
        userCountryIsNeeded({
          summary: createSummary({
            lifecycle: SnsSwapLifecycle.Committed,
            restrictedCountries: ["US"],
          }),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);

      expect(
        userCountryIsNeeded({
          summary: createSummary({
            lifecycle: SnsSwapLifecycle.Aborted,
            restrictedCountries: ["US"],
          }),
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);
    });

    it("country is needed", () => {
      expect(
        userCountryIsNeeded({
          summary: summaryUsRestricted,
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(true);
    });

    it("country not needed if empty list of denied countries", () => {
      expect(
        userCountryIsNeeded({
          summary: summaryNoRestricted,
          swapCommitment: mockSwapCommitment,
          loggedIn: true,
        })
      ).toBe(false);
    });

    it("country not needed if not logged in", () => {
      expect(
        userCountryIsNeeded({
          summary: summaryUsRestricted,
          swapCommitment: mockSwapCommitment,
          loggedIn: false,
        })
      ).toBe(false);
    });

    it("country is not needed if max user commitment is reached", () => {
      expect(
        userCountryIsNeeded({
          summary: summaryUsRestricted,
          swapCommitment: {
            rootCanisterId: mockSwapCommitment.rootCanisterId,
            myCommitment: {
              icp: [
                createTransferableAmount(mockSnsParams.max_participant_icp_e8s),
              ],
              has_created_neuron_recipes: [],
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
              has_created_neuron_recipes: [],
            },
          },
        })
      ).toBe(false);
    });
  });

  describe("currentUserMaxCommitment", () => {
    it("returns the user maximum when no participation yet", () => {
      const projectMax = 10_000_000_000n;
      const userMax = 1_000_000_000n;
      const validProject: SnsFullProject = {
        ...mockSnsFullProject,
        summary: mockSnsFullProject.summary.override({
          derived: {
            buyer_total_icp_e8s: 0n,
            sns_tokens_per_icp: 1,
            cf_participant_count: [],
            direct_participant_count: [],
            cf_neuron_count: [],
            direct_participation_icp_e8s: [],
            neurons_fund_participation_icp_e8s: [],
          },
          swap: {
            ...mockSnsFullProject.summary.swap,
            params: {
              ...mockSnsFullProject.summary.swap.params,
              min_participant_icp_e8s: 100_000_000n,
              max_participant_icp_e8s: userMax,
              max_icp_e8s: projectMax,
            },
          },
        }),
        swapCommitment: undefined,
      };
      expect(currentUserMaxCommitment(validProject)).toEqual(userMax);
    });

    it("returns the remainder to the user maximum if already participated", () => {
      const projectMax = 10_000_000_000n;
      const userMax = 1_000_000_000n;
      const userCommitment = 400_000_000n;
      const validProject: SnsFullProject = {
        ...mockSnsFullProject,
        summary: mockSnsFullProject.summary.override({
          derived: {
            buyer_total_icp_e8s: userCommitment,
            sns_tokens_per_icp: 1,
            cf_participant_count: [],
            direct_participant_count: [],
            cf_neuron_count: [],
            direct_participation_icp_e8s: [],
            neurons_fund_participation_icp_e8s: [],
          },
          swap: {
            ...mockSnsFullProject.summary.swap,
            params: {
              ...mockSnsFullProject.summary.swap.params,
              min_participant_icp_e8s: 100_000_000n,
              max_participant_icp_e8s: userMax,
              max_icp_e8s: projectMax,
            },
          },
        }),
        swapCommitment: {
          ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            icp: [createTransferableAmount(userCommitment)],
            has_created_neuron_recipes: [],
          },
        },
      };
      expect(currentUserMaxCommitment(validProject)).toEqual(
        userMax - userCommitment
      );
    });

    it("returns the remainder to the project maximum if remainder lower than user max", () => {
      const projectMax = 10_000_000_000n;
      const userMax = 1_000_000_000n;
      const projectCommitment = 9_500_000_000n;
      const validProject: SnsFullProject = {
        ...mockSnsFullProject,
        summary: mockSnsFullProject.summary.override({
          derived: {
            buyer_total_icp_e8s: projectCommitment,
            sns_tokens_per_icp: 1,
            cf_participant_count: [],
            direct_participant_count: [],
            cf_neuron_count: [],
            direct_participation_icp_e8s: [],
            neurons_fund_participation_icp_e8s: [],
          },
          swap: {
            ...mockSnsFullProject.summary.swap,
            params: {
              ...mockSnsFullProject.summary.swap.params,
              min_participant_icp_e8s: 100_000_000n,
              max_participant_icp_e8s: userMax,
              max_icp_e8s: projectMax,
            },
          },
        }),
        swapCommitment: undefined,
      };
      expect(currentUserMaxCommitment(validProject)).toEqual(
        projectMax - projectCommitment
      );
    });

    it("returns the remainder to the user maximum even when current commitment minus max is lower than maximum per user", () => {
      const projectMax = 10_000_000_000n;
      const userMax = 1_000_000_000n;
      const projectCommitment = 9_200_000_000n;
      const userCommitment = 400_000_000n;
      const validProject: SnsFullProject = {
        ...mockSnsFullProject,
        summary: mockSnsFullProject.summary.override({
          derived: {
            buyer_total_icp_e8s: projectCommitment,
            sns_tokens_per_icp: 1,
            cf_participant_count: [],
            direct_participant_count: [],
            cf_neuron_count: [],
            direct_participation_icp_e8s: [],
            neurons_fund_participation_icp_e8s: [],
          },
          swap: {
            ...mockSnsFullProject.summary.swap,
            params: {
              ...mockSnsFullProject.summary.swap.params,
              min_participant_icp_e8s: 100_000_000n,
              max_participant_icp_e8s: userMax,
              max_icp_e8s: projectMax,
            },
          },
        }),
        swapCommitment: {
          ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            icp: [createTransferableAmount(userCommitment)],
            has_created_neuron_recipes: [],
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
      const projectMax = 10_000_000_000n;
      const projectCommitment = 9_200_000_000n;
      const summary = mockSnsFullProject.summary.override({
        derived: {
          buyer_total_icp_e8s: projectCommitment,
          sns_tokens_per_icp: 1,
          cf_participant_count: [],
          direct_participant_count: [],
          cf_neuron_count: [],
          direct_participation_icp_e8s: [],
          neurons_fund_participation_icp_e8s: [],
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            min_participant_icp_e8s: 100_000_000n,
            max_participant_icp_e8s: 1_000_000_000n,
            max_icp_e8s: projectMax,
          },
        },
      });
      expect(projectRemainingAmount(summary)).toEqual(
        projectMax - projectCommitment
      );
    });
  });

  describe("validParticipation", () => {
    const validAmountE8s = 1_000_000_000n;
    const validProject: SnsFullProject = {
      ...mockSnsFullProject,
      summary: mockSnsFullProject.summary.override({
        derived: {
          buyer_total_icp_e8s: 0n,
          sns_tokens_per_icp: 1,
          cf_participant_count: [],
          direct_participant_count: [],
          cf_neuron_count: [],
          direct_participation_icp_e8s: [],
          neurons_fund_participation_icp_e8s: [],
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          lifecycle: SnsSwapLifecycle.Open,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            min_participant_icp_e8s: validAmountE8s - 10_000n,
            max_participant_icp_e8s: validAmountE8s + 10_000n,
            max_icp_e8s: validAmountE8s + 10_000n,
          },
        },
      }),
      swapCommitment: {
        ...(mockSnsFullProject.swapCommitment as SnsSwapCommitment),
        myCommitment: {
          icp: [createTransferableAmount(0n)],
          has_created_neuron_recipes: [],
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
        summary: validProject.summary.overrideLifecycle(
          SnsSwapLifecycle.Committed
        ),
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
        summary: validProject.summary.overrideLifecycle(
          SnsSwapLifecycle.Pending
        ),
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
        summary: validProject.summary.override({
          swap: {
            ...validProject.summary.swap,
            params: {
              ...validProject.summary.swap.params,
              max_participant_icp_e8s: validAmountE8s,
            },
          },
        }),
      };
      const { valid } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: validAmountE8s + 10_000n,
          token: ICPToken,
        }),
      });
      expect(valid).toBe(false);
    });

    it("takes into account current participation to calculate the maximum per participant", () => {
      const project: SnsFullProject = {
        ...validProject,
        summary: validProject.summary.override({
          swap: {
            ...validProject.summary.swap,
            params: {
              ...validProject.summary.swap.params,
              max_participant_icp_e8s: validAmountE8s * 2n,
            },
          },
        }),
        swapCommitment: {
          ...(validProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            icp: [createTransferableAmount(validAmountE8s)],
            has_created_neuron_recipes: [],
          },
        },
      };
      const { valid } = validParticipation({
        project,
        amount: TokenAmount.fromE8s({
          amount: validAmountE8s + 10_000n,
          token: ICPToken,
        }),
      });
      expect(valid).toBe(false);
    });

    it("returns false if amount is larger than project remainder to get to maximum", () => {
      const maxE8s = 1_000_000_000n;
      const participationE8s = 100_000_000n;
      const currentE8s = 950_000_000n;
      const project: SnsFullProject = {
        ...validProject,
        summary: validProject.summary.override({
          derived: {
            buyer_total_icp_e8s: currentE8s,
            sns_tokens_per_icp: 1,
            cf_participant_count: [],
            direct_participant_count: [],
            cf_neuron_count: [],
            direct_participation_icp_e8s: [],
            neurons_fund_participation_icp_e8s: [],
          },
          swap: {
            ...validProject.summary.swap,
            params: {
              ...validProject.summary.swap.params,
              max_participant_icp_e8s: maxE8s,
            },
          },
        }),
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
      const maxProject = 100_000_000_000n;
      const minPerUser = 100_000_000n;
      const maxPerUser = 2_000_000_000n;
      const currentProjectParticipation = 99_500_000_000n;
      const currentUserParticipation = 800_000_000n;
      const newParticipation = 600_000_000n;
      const project: SnsFullProject = {
        ...validProject,
        summary: validProject.summary.override({
          derived: {
            buyer_total_icp_e8s: currentProjectParticipation,
            sns_tokens_per_icp: 1,
            cf_participant_count: [],
            direct_participant_count: [],
            cf_neuron_count: [],
            direct_participation_icp_e8s: [],
            neurons_fund_participation_icp_e8s: [],
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
        }),
        swapCommitment: {
          ...(validProject.swapCommitment as SnsSwapCommitment),
          myCommitment: {
            icp: [createTransferableAmount(currentUserParticipation)],
            has_created_neuron_recipes: [],
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
    const maxProject = 100_000_000_000n;
    const minPerUser = 100_000_000n;
    const maxPerUser = 2_000_000_000n;
    const project: SnsFullProject = {
      ...mockSnsFullProject,
      summary: mockSnsFullProject.summary.override({
        derived: {
          buyer_total_icp_e8s: 0n,
          sns_tokens_per_icp: 1,
          cf_participant_count: [],
          direct_participant_count: [],
          cf_neuron_count: [],
          direct_participation_icp_e8s: [],
          neurons_fund_participation_icp_e8s: [],
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
      }),
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
          has_created_neuron_recipes: [],
        },
      };

      // User can participate with amount less than min
      const secondAmountUser = 10n;
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
          amount: maxPerUser - initialAmountUser + 10_000n,
          token: ICPToken,
        }),
      });
      expect(v7).toBe(false);
    });
  });

  describe("commitmentExceedsAmountLeft", () => {
    it("returns true if amount is larger than maximum left", () => {
      const maxE8s = 1_000_000_000n;
      const participationE8s = 100_000_000n;
      const currentE8s = 950_000_000n;
      const summary = mockSnsFullProject.summary.override({
        derived: {
          buyer_total_icp_e8s: currentE8s,
          sns_tokens_per_icp: 1,
          cf_participant_count: [],
          direct_participant_count: [],
          cf_neuron_count: [],
          direct_participation_icp_e8s: [],
          neurons_fund_participation_icp_e8s: [],
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            max_icp_e8s: maxE8s,
          },
        },
      });
      const expected = commitmentExceedsAmountLeft({
        summary,
        amountE8s: participationE8s,
      });
      expect(expected).toBe(true);
    });

    it("returns false if amount is smaller than maximum left", () => {
      const maxE8s = 1_000_000_000n;
      const participationE8s = 100_000_000n;
      const currentE8s = 850_000_000n;
      const summary = mockSnsFullProject.summary.override({
        derived: {
          buyer_total_icp_e8s: currentE8s,
          sns_tokens_per_icp: 1,
          cf_participant_count: [],
          direct_participant_count: [],
          cf_neuron_count: [],
          direct_participation_icp_e8s: [],
          neurons_fund_participation_icp_e8s: [],
        },
        swap: {
          ...mockSnsFullProject.summary.swap,
          params: {
            ...mockSnsFullProject.summary.swap.params,
            max_icp_e8s: maxE8s,
          },
        },
      });
      const expected = commitmentExceedsAmountLeft({
        summary,
        amountE8s: participationE8s,
      });
      expect(expected).toBe(false);
    });
  });

  describe("participateButtonStatus", () => {
    const summary = mockSnsFullProject.summary;

    const notOpenSummary = mockSnsFullProject.summary.overrideLifecycle(
      SnsSwapLifecycle.Committed
    );

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
      amount_icp_e8s: 1_000_000_000n,
    };

    it("returns 'logged-out' if user is not logged in", () => {
      const expected = participateButtonStatus({
        loggedIn: false,
        summary,
        swapCommitment: userNoCommitment,
        userCountry: NOT_LOADED,
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
          userCountry: { isoCode: "CH" },
          ticket: null,
        })
      ).toBe("loading");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: null,
          userCountry: { isoCode: "CH" },
          ticket: null,
        })
      ).toBe("loading");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary: null,
          swapCommitment: userNoCommitment,
          userCountry: { isoCode: "CH" },
          ticket: null,
        })
      ).toBe("loading");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary: undefined,
          swapCommitment: userNoCommitment,
          userCountry: { isoCode: "CH" },
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
          userCountry: { isoCode: "CH" },
          ticket: undefined,
        })
      ).toBe("loading");
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: userNoCommitment,
          userCountry: { isoCode: "CH" },
          ticket: testTicket,
        })
      ).toBe("loading");
    });

    it("returns 'disabled-not-open' if project is not open", () => {
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary: notOpenSummary,
          swapCommitment: userNoCommitment,
          userCountry: { isoCode: "CH" },
          ticket: null,
        })
      ).toBe("disabled-not-open");
    });

    it("returns 'disabled-max-participation' if user already participated with max amount", () => {
      const userMaxCommitment: SnsSwapCommitment = {
        rootCanisterId: mockSnsFullProject.rootCanisterId,
        myCommitment: {
          icp: [
            createTransferableAmount(
              summary.swap.params.max_participant_icp_e8s + 1n
            ),
          ],
          has_created_neuron_recipes: [],
        },
      };
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary,
          swapCommitment: userMaxCommitment,
          userCountry: { isoCode: "CH" },
          ticket: null,
        })
      ).toBe("disabled-max-participation");
    });

    it("returns 'enabled' if there are no restricted countries", () => {
      expect(
        participateButtonStatus({
          loggedIn: true,
          summary: summaryNoRestricted,
          swapCommitment: userNoCommitment,
          userCountry: NOT_LOADED,
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
      it("returns 'disabled-not-eligible' if user is in a restricted country", () => {
        expect(
          participateButtonStatus({
            loggedIn: true,
            summary: summaryUsRestricted,
            swapCommitment: userNoCommitment,
            userCountry: { isoCode: "US" },
            ticket: null,
          })
        ).toBe("disabled-not-eligible");
      });

      it("returns 'loading' if no user country but restricted list is not empty", () => {
        expect(
          participateButtonStatus({
            loggedIn: true,
            summary: summaryUsRestricted,
            swapCommitment: userNoCommitment,
            userCountry: NOT_LOADED,
            ticket: null,
          })
        ).toBe("loading");
      });

      it("returns 'enabled' if it fails to get the user country", () => {
        expect(
          participateButtonStatus({
            loggedIn: true,
            summary: summaryUsRestricted,
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
            summary: summaryUsRestricted,
            swapCommitment: userNoCommitment,
            userCountry: { isoCode: "SP" },
            ticket: null,
          })
        ).toBe("enabled");
      });
    });
  });

  describe("differentSummaries", () => {
    it("should return empty array for the same summaries", () => {
      expect(
        differentSummaries([summaryUsRestricted], [summaryUsRestricted])
      ).toHaveLength(0);
    });

    it("should return the different summaries", () => {
      const sameButDifferent = summaryNoRestricted.override({
        token: {
          ...summaryNoRestricted.token,
          name: "not the same",
        },
      });
      expect(
        differentSummaries(
          [summaryUsRestricted, sameButDifferent],
          [summaryUsRestricted, summaryNoRestricted]
        )
      ).toEqual([sameButDifferent]);
    });
  });

  describe("getProjectCommitmentSplit", () => {
    const nfCommitment = 10_000_000_000n;
    const directCommitment = 20_000_000_000n;

    describe("when NF participation is present", () => {
      it("returns the commitments split if min-max direct participations are present", () => {
        const minDirectParticipation = 10_000_000_000n;
        const maxDirectParticipation = 100_000_000_000n;
        const summary = createSummary({
          currentTotalCommitment: directCommitment + nfCommitment,
          directCommitment,
          neuronsFundCommitment: nfCommitment,
          minDirectParticipation,
          maxDirectParticipation,
        });

        expect(getProjectCommitmentSplit(summary)).toEqual({
          totalCommitmentE8s: directCommitment + nfCommitment,
          directCommitmentE8s: directCommitment,
          nfCommitmentE8s: nfCommitment,
          minDirectCommitmentE8s: minDirectParticipation,
          maxDirectCommitmentE8s: maxDirectParticipation,
          isNFParticipating: true,
        });
      });

      it("returns the full commitment if min direct participation is not present", () => {
        const summary = createSummary({
          currentTotalCommitment: directCommitment + nfCommitment,
          directCommitment,
          neuronsFundCommitment: nfCommitment,
          minDirectParticipation: undefined,
          maxDirectParticipation: 100_000_000_000n,
        });
        expect(getProjectCommitmentSplit(summary)).toEqual({
          totalCommitmentE8s: 30_000_000_000n,
        });
      });

      it("returns the full commitment if max direct participation is not present", () => {
        const summary = createSummary({
          currentTotalCommitment: directCommitment + nfCommitment,
          directCommitment,
          neuronsFundCommitment: nfCommitment,
          minDirectParticipation: 100_000_000_000n,
          maxDirectParticipation: undefined,
        });
        expect(getProjectCommitmentSplit(summary)).toEqual({
          totalCommitmentE8s: 30_000_000_000n,
        });
      });
    });

    describe("when NF participation is 0", () => {
      it("returns the commitments split if NF participation is present even when 0", () => {
        const directCommitment = 20_000_000_000n;
        const minDirectParticipation = 10_000_000_000n;
        const maxDirectParticipation = 100_000_000_000n;
        const summary = createSummary({
          currentTotalCommitment: directCommitment,
          directCommitment,
          neuronsFundCommitment: 0n,
          minDirectParticipation,
          maxDirectParticipation,
        });
        expect(getProjectCommitmentSplit(summary)).toEqual({
          totalCommitmentE8s: 20_000_000_000n,
          directCommitmentE8s: 20_000_000_000n,
          nfCommitmentE8s: 0n,
          minDirectCommitmentE8s: minDirectParticipation,
          maxDirectCommitmentE8s: maxDirectParticipation,
          isNFParticipating: true,
        });
      });
    });

    describe("when direct participation is not present", () => {
      it("returns the overall commitments even if nf commitment and min-max direct participations are present", () => {
        const minDirectParticipation = 10_000_000_000n;
        const maxDirectParticipation = 100_000_000_000n;

        const currentTotalCommitment = 30_000_000_000n;
        const summary = createSummary({
          currentTotalCommitment,
          directCommitment: undefined,
          neuronsFundCommitment: 10n,
          minDirectParticipation,
          maxDirectParticipation,
        });

        expect(getProjectCommitmentSplit(summary)).toEqual({
          totalCommitmentE8s: currentTotalCommitment,
        });
      });
    });

    describe("when neurons fund participation is not present", () => {
      it("returns the overall commitments even if nf commitment and min-max direct participations are present", () => {
        const minDirectParticipation = 10_000_000_000n;
        const maxDirectParticipation = 100_000_000_000n;

        const summary = createSummary({
          currentTotalCommitment: nfCommitment + directCommitment,
          directCommitment: directCommitment,
          neuronsFundCommitment: nfCommitment,
          minDirectParticipation,
          maxDirectParticipation,
          neuronsFundIsParticipating: [],
        });

        expect(getProjectCommitmentSplit(summary)).toEqual({
          totalCommitmentE8s: nfCommitment + directCommitment,
        });
      });
    });

    describe("when NF enhancement fields are present, but NF is not participating", () => {
      it("returns the commitments split with NF as `null`", () => {
        const minDirectParticipation = 10_000_000_000n;
        const maxDirectParticipation = 100_000_000_000n;
        const summary = createSummary({
          currentTotalCommitment: directCommitment,
          directCommitment,
          neuronsFundCommitment: undefined,
          minDirectParticipation,
          maxDirectParticipation,
          neuronsFundIsParticipating: [false],
        });

        expect(getProjectCommitmentSplit(summary)).toEqual({
          totalCommitmentE8s: directCommitment,
          directCommitmentE8s: directCommitment,
          nfCommitmentE8s: undefined,
          minDirectCommitmentE8s: minDirectParticipation,
          maxDirectCommitmentE8s: maxDirectParticipation,
          isNFParticipating: false,
        });
      });
    });
  });

  describe("snsProjectDashboardUrl", () => {
    it("returns a link to the dashboard", () => {
      expect(snsProjectDashboardUrl(Principal.fromText("aaaaa-aa"))).toBe(
        "https://dashboard.internetcomputer.org/sns/aaaaa-aa"
      );
      expect(
        snsProjectDashboardUrl(
          Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai")
        )
      ).toBe(
        "https://dashboard.internetcomputer.org/sns/pin7y-wyaaa-aaaaa-aacpa-cai"
      );
    });
  });
});
