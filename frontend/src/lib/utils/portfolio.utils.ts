import { abandonedProjectsCanisterId } from "$lib/constants/canister-ids.constants";
import type { TableProject } from "$lib/types/staking";
import type { UserToken, UserTokenData } from "$lib/types/tokens-page";
import { nowInSeconds } from "$lib/utils/date.utils";
import { formatNumber } from "$lib/utils/format.utils";
import type { FullProjectCommitmentSplit } from "$lib/utils/projects.utils";
import {
  createAscendingComparator,
  createDescendingComparator,
  mergeComparators,
} from "$lib/utils/sort.utils";
import {
  compareByProjectTitle,
  compareIcpFirst,
} from "$lib/utils/staking.utils";
import { ulpsToNumber } from "$lib/utils/token.utils";
import {
  compareTokensByImportance,
  compareTokensIcpFirst,
} from "$lib/utils/tokens-table.utils";
import { isUserTokenData } from "$lib/utils/user-token.utils";
import type { ProposalId, ProposalInfo } from "@dfinity/nns";
import { ICPToken, isNullish } from "@dfinity/utils";

const MAX_NUMBER_OF_ITEMS = 4;

const filterCyclesTransferStation = ({
  universeId,
}: {
  universeId: string;
}): boolean => !abandonedProjectsCanisterId.includes(universeId);

const compareTokensByUsdBalance = createDescendingComparator(
  (token: UserTokenData) => token?.balanceInUsd ?? 0 > 0
);

const compareTokens = mergeComparators([
  compareTokensIcpFirst,
  compareTokensByUsdBalance,
  compareTokensByImportance,
]);

/**
 * Filters and sorts user tokens based on specific criteria:
 * - Always prioritizes ICP token first
 * - Sorts remaining tokens by USD balance
 * - Sorts remaining tokens by importance
 * - Limits the number of returned tokens to MAX_NUMBER_OF_ITEMS
 * - When isSigned true, filters out tokens with zero balance as we show only tokens with guaranteed balance
 */
export const getTopHeldTokens = ({
  userTokens,
  isSignedIn = false,
}: {
  userTokens: UserToken[];
  isSignedIn?: boolean;
}): UserTokenData[] => {
  const topTokens = userTokens
    .filter(isUserTokenData)
    .filter(({ universeId }) =>
      filterCyclesTransferStation({ universeId: universeId.toText() })
    )
    .sort(compareTokens)
    .slice(0, MAX_NUMBER_OF_ITEMS);

  if (!isSignedIn) return topTokens;

  return topTokens.filter((token) => token?.balanceInUsd ?? 0 > 0);
};

const compareProjectsByUsdBalance = createDescendingComparator(
  (project: TableProject) => project?.stakeInUsd ?? 0 > 0
);

const compareProjects = mergeComparators([
  compareIcpFirst,
  compareProjectsByUsdBalance,
  compareByProjectTitle,
]);

/**
 * Filters and sorts projects based on specific criteria:
 * - Always prioritizes ICP project first
 * - Sorts remaining projects by USD stake value
 * - Sorts remaining projects by title alphabetically
 * - Limits the number of returned projects to MAX_NUMBER_OF_ITEMS
 * - When isSignedIn true, filters out projects with zero stake as we show only projects with guaranteed stake
 */
export const getTopStakedTokens = ({
  projects,
  isSignedIn = false,
}: {
  projects: TableProject[];
  isSignedIn?: boolean;
}): TableProject[] => {
  const topProjects = [...projects]
    .filter(filterCyclesTransferStation)
    .sort(compareProjects)
    .slice(0, MAX_NUMBER_OF_ITEMS);

  if (!isSignedIn) return topProjects;

  return topProjects.filter((project) => project?.stakeInUsd ?? 0 > 0);
};

/**
 * Determines whether to show an info row in a card based on specific display rules.
 * This ensures both cards have consistent heights by filling empty space
 * with a message instead of leaving a blank space.
 * Rules for showing the info row:
 * 1. When the other card has more tokens than the current card
 * 2. When the other card is empty (has 0 tokens) AND current card has fewer than 4 tokens
 * 3. When both cards have fewer than 3 tokens (for visual balance)
 */
export const shouldShowInfoRow = ({
  currentCardNumberOfTokens,
  otherCardNumberOfTokens,
}: {
  currentCardNumberOfTokens: number;
  otherCardNumberOfTokens: number;
}) => {
  return (
    otherCardNumberOfTokens > currentCardNumberOfTokens ||
    (otherCardNumberOfTokens === 0 && currentCardNumberOfTokens < 4) ||
    (currentCardNumberOfTokens < 4 && otherCardNumberOfTokens < 4)
  );
};

export const formatParticipation = (ulps: bigint) => {
  const value = ulpsToNumber({ ulps, token: ICPToken });
  if (value < 1_000) {
    return formatNumber(value, { minFraction: 0, maxFraction: 2 });
  }

  if (value < 1_000_000) {
    const thousands = value / 1_000;
    return `${formatNumber(thousands, { minFraction: 0, maxFraction: 2 })}k`;
  }

  const millions = value / 1_000_000;
  return `${formatNumber(millions, { minFraction: 0, maxFraction: 2 })}M`;
};

export const getMinCommitmentPercentage = (
  projectCommitments: FullProjectCommitmentSplit
) => {
  if (projectCommitments.minDirectCommitmentE8s === 0n) return 0;

  return (
    ulpsToNumber({
      ulps: projectCommitments.directCommitmentE8s,
      token: ICPToken,
    }) /
    ulpsToNumber({
      ulps: projectCommitments.minDirectCommitmentE8s,
      token: ICPToken,
    })
  );
};

export const mapProposalInfoToCard = (
  proposalInfo: ProposalInfo
):
  | undefined
  | {
      durationTillDeadline: bigint;
      id: ProposalId;
      title: string | undefined;
      logo: string | undefined;
      name: string | undefined;
    } => {
  const proposal = proposalInfo?.proposal;
  const action = proposal?.action;

  if (isNullish(action) || isNullish(proposal)) return undefined;
  if (!("CreateServiceNervousSystem" in action)) return undefined;

  const title = proposal.title;
  const { id, deadlineTimestampSeconds } = proposalInfo;
  const durationTillDeadline = deadlineTimestampSeconds
    ? deadlineTimestampSeconds - BigInt(nowInSeconds())
    : 0n;
  const logo: string | undefined =
    action.CreateServiceNervousSystem?.logo?.base64Encoding;
  const name: string | undefined = action.CreateServiceNervousSystem?.name;

  return {
    durationTillDeadline,
    logo,
    name,
    title,
    id: id as ProposalId,
  };
};

export const compareProposalInfoByDeadlineTimestampSeconds =
  createAscendingComparator(
    (proposal: ProposalInfo) => proposal.deadlineTimestampSeconds
  );
