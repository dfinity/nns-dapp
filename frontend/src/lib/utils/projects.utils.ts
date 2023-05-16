import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import { getDeniedCountries } from "$lib/getters/sns-summary";
import type { CountryCode } from "$lib/types/location";
import type {
  SnsSummary,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "$lib/types/sns";
import type { TokenAmount } from "@dfinity/nns";
import { SnsSwapLifecycle, type SnsSwapTicket } from "@dfinity/sns";
import { isNullish, nonNullish } from "@dfinity/utils";
import { nowInSeconds } from "./date.utils";
import type { I18nSubstitutions } from "./i18n.utils";
import { getCommitmentE8s } from "./sns.utils";
import { formatToken } from "./token.utils";

export const filterProjectsStatus = ({
  swapLifecycle,
  projects,
}: {
  swapLifecycle: SnsSwapLifecycle;
  projects: SnsFullProject[];
}): SnsFullProject[] =>
  projects.filter(
    ({
      summary: {
        swap: { lifecycle },
      },
    }) => swapLifecycle === lifecycle
  );

export const filterCommittedProjects = (
  projects: SnsFullProject[]
): SnsFullProject[] =>
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
export const filterActiveProjects = (
  projects: SnsFullProject[]
): SnsFullProject[] =>
  projects?.filter(
    ({
      summary: {
        swap: { lifecycle },
      },
    }) =>
      [
        SnsSwapLifecycle.Committed,
        SnsSwapLifecycle.Open,
        SnsSwapLifecycle.Adopted,
      ].includes(lifecycle)
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
 * Duration in seconds until the start of the swap if defined.
 * @param swap
 */
export const durationTillSwapStart = ({
  decentralization_sale_open_timestamp_seconds,
}: SnsSummarySwap): bigint | undefined =>
  decentralization_sale_open_timestamp_seconds !== undefined
    ? decentralization_sale_open_timestamp_seconds - BigInt(nowInSeconds())
    : undefined;

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
// Checks whether the amount that the user wants to contribute is lower than the minimum for the project.
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
  const myCommitment = getCommitmentE8s(swapCommitment) ?? BigInt(0);

  return (
    summary !== undefined &&
    summary !== null &&
    isProjectOpen(summary) &&
    // Whether user can still participate with 1 e8
    !commitmentTooLarge({ summary, amountE8s: myCommitment + BigInt(1) })
  );
};

/**
 * Returns whether the location of the user is needed to participate to the swap.
 *
 * Some projects might restrict participation in the swap to users from specific countries.
 *
 * Yet, we don't need to get the location of all users, only those who can to participate to the swap:
 *
 * - Same logic as canUserParticipateToSwap
 * - User is logged in (this logic is assumed in the previous function)
 * - Project has a deny_list of countries (TODO: add new fields in the swap params)
 */
export const userCountryIsNeeded = ({
  summary,
  swapCommitment,
  loggedIn,
}: {
  summary: SnsSummary | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
  loggedIn: boolean;
}): boolean =>
  canUserParticipateToSwap({ summary, swapCommitment }) &&
  loggedIn &&
  nonNullish(summary) &&
  getDeniedCountries(summary).length > 0;

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
        $newCommitment: formatToken({ value: amount.toE8s() }),
        $currentCommitment: formatToken({
          value: getCommitmentE8s(project.swapCommitment) ?? BigInt(0),
        }),
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

type ParticipationButtonStatus =
  | "disabled-max-participation"
  | "disabled-not-eligible"
  | "disabled-not-open"
  | "enabled"
  | "loading"
  | "logged-out";

/**
 * Returns the status of the Participate Button.
 *
 * There are 6 possible statuses:
 * - logged-out: the user is not logged in.
 * - loading: the status is not yet known. Any of the resources is stil being fetched.
 * - disabled-not-open: the project is not open.
 * - disabled-max-participation: the user has already participated in the swap with the maximum per user and cannot participate again.
 * - disabled-not-eligible: the user is not eligible to participate in the swap. E.g. user location in the restricted countries list.
 * - enabled: the user can participate in the swap.
 *
 * logged-out:
 * - The user is not logged in.
 *
 * loading:
 * - Fetching any of the data
 * - Found an open ticket.
 *
 * disabled-max-participation:
 * - The user has already participated to the swap with the maximum per user.
 *
 * disabled-not-eligible:
 * - The user is in a restricted country.
 *
 * disabled-not-open:
 * - The project is not open.
 *
 * enabled:
 * - None of the above.
 *
 * @param {Object} params
 * @param {SnsSummary | null | undefined} params.summary SNS Summary
 * @param {SnsSwapCommitment | null | undefined} params.swapCommitment User's swap commitment
 * @param {SnsSwapTicket | null | undefined} params.ticket The open ticket of the user. The meaning of the types is the same as in ticketsStore.
 * @param {boolean} params.loggedIn Whether the user is logged in or not.
 * @param {CountryCode | undefined | Error} params.userCountry The location of the user. The meaning of the types is the same as in userCountryStore.
 * @returns {ParticipationButtonStatus} A string representing the status of the button.
 */
export const participateButtonStatus = ({
  summary,
  swapCommitment,
  loggedIn,
  ticket,
  userCountry,
}: {
  summary: SnsSummary | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
  loggedIn: boolean;
  ticket: SnsSwapTicket | undefined | null;
  userCountry: CountryCode | undefined | Error;
}): ParticipationButtonStatus => {
  if (!loggedIn) {
    return "logged-out";
  }

  const currentCommitment = getCommitmentE8s(swapCommitment);
  if (isNullish(summary) || isNullish(currentCommitment)) {
    return "loading";
  }

  if (!isProjectOpen(summary)) {
    return "disabled-not-open";
  }

  // If `ticket` is undefined, it means that the ticket is still being fetched.
  // If `ticket` is not null, it means there is an ongoing participation already.
  if (ticket === undefined || ticket !== null) {
    return "loading";
  }

  // Whether user can still participate with 1 e8
  const userReachedMaxCommitment = commitmentTooLarge({
    summary,
    amountE8s: currentCommitment + BigInt(1),
  });
  if (userReachedMaxCommitment) {
    return "disabled-max-participation";
  }

  const projectDeniedCountries = getDeniedCountries(summary);
  if (projectDeniedCountries.length > 0) {
    // We tried to get the user country but it failed.
    // We don't want to block the user from participating.
    if (userCountry instanceof Error) {
      return "enabled";
    }

    if (userCountry === undefined) {
      return "loading";
    }

    if (projectDeniedCountries.includes(userCountry)) {
      return "disabled-not-eligible";
    }
  }

  return "enabled";
};
