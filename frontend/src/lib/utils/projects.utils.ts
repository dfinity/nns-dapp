import type { TokenAmount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import type { SnsFullProject } from "$lib/stores/projects.store";
import type {
  SnsSummary,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "$lib/types/sns";
import { nowInSeconds } from "./date.utils";
import type { I18nSubstitutions } from "./i18n.utils";
import { formatToken } from "./icp.utils";
import { getCommitmentE8s } from "./sns.utils";

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
        swap: { lifecycle },
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
        swap: { lifecycle },
      },
    }) =>
      [SnsSwapLifecycle.Committed, SnsSwapLifecycle.Open].includes(lifecycle)
  );

/**
 * Duration in seconds until the end of the swap if defined.
 * @param swap
 */
export const durationTillSwapDeadline = ({
  params: { swap_due_timestamp_seconds },
}: SnsSummarySwap): bigint | undefined =>
  swap_due_timestamp_seconds - BigInt(nowInSeconds());

/**
 * Returns the minimum between:
 * - user remaining commitment to reach user maximum
 * - remaining commitment to reach project maximum
 */
export const currentUserMaxCommitment = ({
  summary: { swap, derived },
  swapCommitment,
}: {
  summary: SnsSummary;
  swapCommitment: SnsSwapCommitment | undefined | null;
}): bigint => {
  const remainingProjectCommitment =
    swap.params.max_icp_e8s - derived.buyer_total_icp_e8s;
  const remainingUserCommitment =
    swap.params.max_participant_icp_e8s -
    (getCommitmentE8s(swapCommitment) ?? BigInt(0));
  return remainingProjectCommitment < remainingUserCommitment
    ? remainingProjectCommitment
    : remainingUserCommitment;
};

export const projectRemainingAmount = ({ swap, derived }: SnsSummary): bigint =>
  swap.params.max_icp_e8s - derived.buyer_total_icp_e8s;

const isProjectOpen = (summary: SnsSummary): boolean =>
  summary.swap.lifecycle === SnsSwapLifecycle.Open;
// Checks whether the amount that the user wants to contiribute is lower than the minimum for the project.
// It takes into account the current commitment of the user.
const commitmentTooSmall = ({
  project: { summary, swapCommitment },
  amount,
}: {
  project: SnsFullProject;
  amount: TokenAmount;
}): boolean =>
  summary.swap.params.min_participant_icp_e8s >
  amount.toE8s() + (getCommitmentE8s(swapCommitment) ?? BigInt(0));
const commitmentTooLarge = ({
  summary,
  amountE8s,
}: {
  summary: SnsSummary;
  amountE8s: bigint;
}): boolean => summary.swap.params.max_participant_icp_e8s < amountE8s;
// Checks whether the amount that the user wants to contribute
// plus the amount that all users have contributed so far
// exceeds the maximum amount that the project can accept.
export const commitmentExceedsAmountLeft = ({
  summary,
  amountE8s,
}: {
  summary: SnsSummary;
  amountE8s: bigint;
}): boolean => projectRemainingAmount(summary) < amountE8s;

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
  const myCommitment: bigint = getCommitmentE8s(swapCommitment) ?? BigInt(0);

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
}): boolean => (getCommitmentE8s(swapCommitment) ?? BigInt(0)) > BigInt(0);

export const validParticipation = ({
  project,
  amount,
}: {
  project: SnsFullProject | undefined;
  amount: TokenAmount;
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
        $amount: formatToken({
          value: project.summary.swap.params.min_participant_icp_e8s,
        }),
      },
    };
  }
  const totalCommitment =
    (getCommitmentE8s(project.swapCommitment) ?? BigInt(0)) + amount.toE8s();
  if (
    commitmentTooLarge({ summary: project.summary, amountE8s: totalCommitment })
  ) {
    return {
      valid: false,
      labelKey: "error__sns.commitment_too_large",
      substitutions: {
        $commitment: formatToken({ value: totalCommitment }),
        $maxCommitment: formatToken({
          value: project.summary.swap.params.max_participant_icp_e8s,
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
        $commitment: formatToken({ value: totalCommitment }),
        $remainingCommitment: formatToken({
          value:
            project.summary.swap.params.max_icp_e8s -
            project.summary.derived.buyer_total_icp_e8s,
        }),
      },
    };
  }
  return { valid: true };
};

export const isNnsProject = (canisterId: Principal): boolean =>
  canisterId.toText() === OWN_CANISTER_ID.toText();
