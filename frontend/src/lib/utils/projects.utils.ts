import { NOT_LOADED } from "$lib/constants/stores.constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import {
  getDeniedCountries,
  getMaxDirectParticipation,
  getMinDirectParticipation,
  getNeuronsFundParticipation,
} from "$lib/getters/sns-summary";
import type { Country } from "$lib/types/location";
import type {
  SnsSummary,
  SnsSummarySwap,
  SnsSwapCommitment,
} from "$lib/types/sns";
import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
import type { StoreData } from "$lib/types/store";
import type { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle, type SnsSwapTicket } from "@dfinity/sns";
import {
  fromNullable,
  isNullish,
  nonNullish,
  type TokenAmount,
} from "@dfinity/utils";
import { nowInSeconds } from "./date.utils";
import type { I18nSubstitutions } from "./i18n.utils";
import { getCommitmentE8s } from "./sns.utils";
import { formatTokenE8s } from "./token.utils";
import { stringifyJson } from "./utils";

export const filterProjectsStatus = ({
  swapLifecycle,
  projects,
}: {
  swapLifecycle: SnsSwapLifecycle;
  projects: SnsFullProject[];
}): SnsFullProject[] =>
  projects.filter(({ summary }) => swapLifecycle === summary.getLifecycle());

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
  projects?.filter(({ summary }) =>
    [
      SnsSwapLifecycle.Committed,
      SnsSwapLifecycle.Open,
      SnsSwapLifecycle.Adopted,
    ].includes(summary.getLifecycle())
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
  summary,
  swapCommitment,
}: {
  summary: SnsSummaryWrapper;
  swapCommitment: SnsSwapCommitment | undefined | null;
}): bigint => {
  const remainingProjectCommitment =
    summary.getMaxIcpE8s() - summary.derived.buyer_total_icp_e8s;
  const remainingUserCommitment =
    summary.getMaxParticipantIcpE8s() -
    (getCommitmentE8s(swapCommitment) ?? 0n);
  return remainingProjectCommitment < remainingUserCommitment
    ? remainingProjectCommitment
    : remainingUserCommitment;
};

export const projectRemainingAmount = (summary: SnsSummaryWrapper): bigint =>
  summary.getMaxIcpE8s() - summary.derived.buyer_total_icp_e8s;

const isProjectOpen = (summary: SnsSummaryWrapper): boolean =>
  summary.getLifecycle() === SnsSwapLifecycle.Open;

// Checks whether the amount that the user wants to contribute is lower than the minimum for the project.
// It takes into account the current commitment of the user.
const commitmentTooSmall = ({
  project: { summary, swapCommitment },
  amount,
}: {
  project: SnsFullProject;
  amount: TokenAmount;
}): boolean =>
  summary.getMinParticipantIcpE8s() >
  amount.toE8s() + (getCommitmentE8s(swapCommitment) ?? 0n);

const commitmentTooLarge = ({
  summary,
  amountE8s,
}: {
  summary: SnsSummaryWrapper;
  amountE8s: bigint;
}): boolean => summary.getMaxParticipantIcpE8s() < amountE8s;

// Checks whether the amount that the user wants to contribute
// plus the amount that all users have contributed so far
// exceeds the maximum amount that the project can accept.
export const commitmentExceedsAmountLeft = ({
  summary,
  amountE8s,
}: {
  summary: SnsSummaryWrapper;
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
  summary: SnsSummaryWrapper | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
}): boolean => {
  const myCommitment = getCommitmentE8s(swapCommitment) ?? 0n;

  return (
    summary !== undefined &&
    summary !== null &&
    isProjectOpen(summary) &&
    // Whether user can still participate with 1 e8
    !commitmentTooLarge({ summary, amountE8s: myCommitment + 1n })
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
  summary: SnsSummaryWrapper | undefined | null;
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
}): boolean => (getCommitmentE8s(swapCommitment) ?? 0n) > 0n;

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
        $amount: formatTokenE8s({
          value: project.summary.getMinParticipantIcpE8s(),
          detailed: true,
        }),
      },
    };
  }
  const totalCommitment =
    (getCommitmentE8s(project.swapCommitment) ?? 0n) + amount.toE8s();
  if (
    commitmentTooLarge({ summary: project.summary, amountE8s: totalCommitment })
  ) {
    return {
      valid: false,
      labelKey: "error__sns.commitment_too_large",
      substitutions: {
        $newCommitment: formatTokenE8s({ value: amount.toE8s() }),
        $currentCommitment: formatTokenE8s({
          value: getCommitmentE8s(project.swapCommitment) ?? 0n,
        }),
        $maxCommitment: formatTokenE8s({
          value: project.summary.getMaxParticipantIcpE8s(),
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
        $commitment: formatTokenE8s({ value: totalCommitment }),
        $remainingCommitment: formatTokenE8s({
          value:
            project.summary.getMaxIcpE8s() -
            project.summary.derived.buyer_total_icp_e8s,
        }),
      },
    };
  }
  return { valid: true };
};

export type ParticipationButtonStatus =
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
 * - logged-out
 * - loading
 * - disabled-not-open
 * - disabled-max-participation
 * - disabled-not-eligible
 * - enabled
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
  summary: SnsSummaryWrapper | undefined | null;
  swapCommitment: SnsSwapCommitment | undefined | null;
  loggedIn: boolean;
  ticket: SnsSwapTicket | undefined | null;
  userCountry: StoreData<Country>;
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
    amountE8s: currentCommitment + 1n,
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

    if (userCountry === NOT_LOADED) {
      return "loading";
    }

    if (projectDeniedCountries.includes(userCountry.isoCode)) {
      return "disabled-not-eligible";
    }
  }

  return "enabled";
};

export const differentSummaries = (
  summaries1: SnsSummary[],
  summaries2: SnsSummary[]
): SnsSummary[] =>
  summaries1.filter((summary1) => {
    const summary2 = summaries2.find(
      ({ rootCanisterId }) =>
        rootCanisterId.toText() === summary1.rootCanisterId.toText()
    );
    // We compare the inner fields because the order when stringifying it might be different
    return (
      stringifyJson(summary1.swap) !== stringifyJson(summary2?.swap) ||
      stringifyJson(summary1.derived) !== stringifyJson(summary2?.derived) ||
      stringifyJson(summary1.token) !== stringifyJson(summary2?.token) ||
      stringifyJson(summary1.metadata) !== stringifyJson(summary2?.metadata) ||
      summary1.governanceCanisterId.toText() !==
        summary2?.governanceCanisterId.toText() ||
      summary1.swapCanisterId.toText() !== summary2?.swapCanisterId.toText() ||
      summary1.rootCanisterId.toText() !== summary2?.rootCanisterId.toText() ||
      summary1.ledgerCanisterId.toText() !==
        summary2?.ledgerCanisterId.toText() ||
      summary1.indexCanisterId.toText() !== summary2?.indexCanisterId.toText()
    );
  });

export type FullProjectCommitmentSplit = {
  totalCommitmentE8s: bigint;
  directCommitmentE8s: bigint;
  nfCommitmentE8s?: bigint;
  minDirectCommitmentE8s: bigint;
  maxDirectCommitmentE8s: bigint;
  isNFParticipating: boolean;
};
export type ProjectCommitmentSplit =
  // old projects
  | { totalCommitmentE8s: bigint }
  // new projects
  | FullProjectCommitmentSplit;

export const getProjectCommitmentSplit = (
  summary: SnsSummary
): ProjectCommitmentSplit => {
  const nfCommitmentE8s = getNeuronsFundParticipation(summary);
  const directCommitmentE8s = fromNullable(
    summary.derived.direct_participation_icp_e8s
  );
  const minDirectCommitmentE8s = getMinDirectParticipation(summary);
  const maxDirectCommitmentE8s = getMaxDirectParticipation(summary);
  const isNFParticipating = fromNullable(
    summary.init?.neurons_fund_participation ?? []
  );

  if (
    nonNullish(isNFParticipating) &&
    nonNullish(directCommitmentE8s) &&
    nonNullish(minDirectCommitmentE8s) &&
    nonNullish(maxDirectCommitmentE8s)
  ) {
    return {
      totalCommitmentE8s: summary.derived.buyer_total_icp_e8s,
      directCommitmentE8s,
      nfCommitmentE8s: isNFParticipating ? nfCommitmentE8s : undefined,
      isNFParticipating,
      minDirectCommitmentE8s,
      maxDirectCommitmentE8s,
    };
  }
  return {
    totalCommitmentE8s: summary.derived.buyer_total_icp_e8s,
  };
};

export const isCommitmentSplitWithNeuronsFund = (
  commitmentSplit: ProjectCommitmentSplit
): commitmentSplit is FullProjectCommitmentSplit =>
  "nfCommitmentE8s" in commitmentSplit;

export const snsProjectDashboardUrl = (rootCanisterId: Principal): string =>
  `https://dashboard.internetcomputer.org/sns/${rootCanisterId.toText()}`;
