import type { ICP } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle, type SnsSwapTimeWindow } from "@dfinity/sns";
import { fromNullable } from "@dfinity/utils";
import { OWN_CANISTER_ID } from "../constants/canister-ids.constants";
import type { SnsFullProject } from "../stores/projects.store";
import type {
  SnsSummary,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "../types/sns";
import { nowInSeconds } from "./date.utils";
import type { I18nSubstitutions } from "./i18n.utils";
import { formatICP } from "./icp.utils";

const filterProjectsStatus = ({
  swapLifecycle,
  projects,
}: {
  swapLifecycle: SnsSwapLifecycle;
  projects: SnsFullProject[] | undefined;
}) =>
  projects?.filter(
    ({
      summary: {
        swap: {
          state: { lifecycle },
        },
      },
    }) => swapLifecycle === lifecycle
  );

export const filterCommittedProjects = (
  projects: SnsFullProject[] | undefined
) =>
  filterProjectsStatus({
    swapLifecycle: SnsSwapLifecycle.Committed,
    projects,
  });

/**
 * Projects displayed in the launchpad are displayed according status if:
 * - status is Pending and time window is defined - i.e. related proposal has been accepted (if not accepted, time window is undefined)
 * - open
 * - complete - we display completed project for a while to make the screen user-friendly
 * @param projects
 */
export const filterActiveProjects = (projects: SnsFullProject[] | undefined) =>
  projects?.filter(
    ({
      summary: {
        swap: {
          state: { lifecycle, open_time_window },
        },
      },
    }) =>
      [SnsSwapLifecycle.Committed, SnsSwapLifecycle.Open].includes(lifecycle) ||
      (SnsSwapLifecycle.Pending === lifecycle && open_time_window.length)
  );

export const openTimeWindow = ({
  state: { open_time_window },
}: SnsSummarySwap): SnsSwapTimeWindow | undefined =>
  fromNullable(open_time_window);

/**
 * Duration in seconds until the end of the swap if defined.
 * @param swap
 */
export const durationTillSwapDeadline = (
  swap: SnsSummarySwap
): bigint | undefined => {
  const timeWindow: SnsSwapTimeWindow | undefined = openTimeWindow(swap);

  // e.g. proposal to start swap has not been accepted yet
  if (timeWindow === undefined) {
    return undefined;
  }

  const { end_timestamp_seconds } = timeWindow;
  return end_timestamp_seconds - BigInt(nowInSeconds());
};

/**
 * If defined the duration of the swap in seconds - i.e. the duration from start till end
 * @param swap
 */
export const swapDuration = (swap: SnsSummarySwap): bigint | undefined => {
  const timeWindow: SnsSwapTimeWindow | undefined = openTimeWindow(swap);

  // e.g. proposal to start swap has not been accepted yet
  if (timeWindow === undefined) {
    return undefined;
  }

  const { start_timestamp_seconds, end_timestamp_seconds } = timeWindow;
  return end_timestamp_seconds - start_timestamp_seconds;
};

/**
 * If defined the duration until the swap start in seconds
 * @param swap
 */
export const durationTillSwapStart = (
  swap: SnsSummarySwap
): bigint | undefined => {
  const timeWindow: SnsSwapTimeWindow | undefined = openTimeWindow(swap);

  // e.g. proposal to start swap has not been accepted yet
  if (timeWindow === undefined) {
    return undefined;
  }

  const { start_timestamp_seconds } = timeWindow;
  return BigInt(nowInSeconds()) - start_timestamp_seconds;
};

const isProjectOpen = (summary: SnsSummary): boolean =>
  summary.swap.state.lifecycle === SnsSwapLifecycle.Open;
const commitmentTooSmall = ({
  project,
  amount,
}: {
  project: SnsFullProject;
  amount: ICP;
}): boolean =>
  project.summary.swap.init.min_participant_icp_e8s > amount.toE8s();
const commitmentTooLarge = ({
  summary,
  amountE8s,
}: {
  summary: SnsSummary;
  amountE8s: bigint;
}): boolean => summary.swap.init.max_participant_icp_e8s < amountE8s;
// Checks whether the amount that the user wants to contiribute
// plus the amount that all users have contributed so far
// exceeds the maximum amount that the project can accept.
const commitmentExceedsAmountLeft = ({
  summary: { swap, derived },
  amountE8s,
}: {
  summary: SnsSummary;
  amountE8s: bigint;
}): boolean => swap.init.max_icp_e8s - derived.buyer_total_icp_e8s < amountE8s;

/**
 * To participate to a swap:
 *
 * - the sale's lifecycle should be Open
 * - user commitment should not be bigger than the maximal commitment allowed per user
 * - the maximal commitment allowed per user should be defined
 */
export const canUserParticipateToSwap = ({
  summary,
  swapCommitment,
}: {
  summary: SnsSummary | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
}): boolean => {
  const myCommitment: bigint =
    swapCommitment?.myCommitment?.amount_icp_e8s ?? BigInt(0);

  return (
    summary !== undefined &&
    summary !== null &&
    isProjectOpen(summary) &&
    // Whether user can still participate with 1 e8
    !commitmentTooLarge({ summary, amountE8s: myCommitment + BigInt(1) })
  );
};

export const hasUserParticipatedToSwap = ({
  swapCommitment,
}: {
  swapCommitment: SnsSwapCommitment | undefined | null;
}): boolean =>
  (swapCommitment?.myCommitment?.amount_icp_e8s ?? BigInt(0)) > BigInt(0);

export const validParticipation = ({
  project,
  amount,
}: {
  project: SnsFullProject | undefined;
  amount: ICP;
}): {
  valid: boolean;
  labelKey?: string;
  substitutions?: I18nSubstitutions;
} => {
  if (project === undefined) {
    return { valid: false, labelKey: "error__sns.project_not_found" };
  }
  if (!isProjectOpen(project.summary)) {
    return {
      valid: false,
      labelKey: "error__sns.project_not_open",
    };
  }
  if (commitmentTooSmall({ project, amount })) {
    return {
      valid: false,
      labelKey: "error__sns.not_enough_amount",
      substitutions: {
        $amount: formatICP({
          value: project.summary.swap.init.min_participant_icp_e8s,
        }),
      },
    };
  }
  const userCommitment =
    project.swapCommitment?.myCommitment?.amount_icp_e8s ?? BigInt(0);
  const totalCommitment = userCommitment + amount.toE8s();
  if (
    commitmentTooLarge({ summary: project.summary, amountE8s: totalCommitment })
  ) {
    return {
      valid: false,
      labelKey: "error__sns.commitment_too_large",
      substitutions: {
        $commitment: formatICP({ value: totalCommitment }),
        $maxCommitment: formatICP({
          value: project.summary.swap.init.max_participant_icp_e8s,
        }),
      },
    };
  }
  if (
    commitmentExceedsAmountLeft({
      summary: project.summary,
      amountE8s: amount.toE8s(),
    })
  ) {
    return {
      valid: false,
      labelKey: "error__sns.commitment_exceeds_current_allowed",
      substitutions: {
        $commitment: formatICP({ value: amount.toE8s() }),
        $remainingCommitment: formatICP({
          value:
            project.summary.swap.init.max_icp_e8s -
            project.summary.derived.buyer_total_icp_e8s,
        }),
      },
    };
  }
  return { valid: true };
};

export const isNnsProject = (canisterId: Principal): boolean =>
  canisterId.toText() === OWN_CANISTER_ID.toText();
