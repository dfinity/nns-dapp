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
import { compareByProjectTitle, isIcpProject } from "$lib/utils/staking.utils";
import { ulpsToNumber } from "$lib/utils/token.utils";
import {
  compareTokensByImportance,
  isIcpToken,
} from "$lib/utils/tokens-table.utils";
import { isUserTokenData } from "$lib/utils/user-token.utils";
import type { ProposalId, ProposalInfo } from "@dfinity/nns";
import { ICPToken, isNullish } from "@dfinity/utils";

// Tables contain 4 items: ICP and 3 other tokens/projects with the highest USD balance.
const MAX_NUMBER_OF_ITEMS = 3;

const filterAbandonedProjects = ({
  universeId,
}: {
  universeId: string;
}): boolean => !abandonedProjectsCanisterId.includes(universeId);

const compareTokensByUsdBalance = createDescendingComparator(
  (token: UserTokenData) => token?.balanceInUsd ?? 0 > 0
);

const compareTokens = mergeComparators([
  compareTokensByUsdBalance,
  compareTokensByImportance,
]);

/**
 * Filters and sorts user tokens based on specific criteria:
 * - ICP is always first
 * - Sorts remaining tokens by USD balance
 * - Limits the number of returned tokens to MAX_NUMBER_OF_ITEMS
 */
export const getTopHeldTokens = ({
  userTokens,
}: {
  userTokens: UserToken[];
}): UserTokenData[] => {
  // TODO: userTokens type can be narrowed to UserTokenData[] after updating Portfolio page
  const userTokensData = userTokens.filter(isUserTokenData);

  const icp = userTokensData.find(isIcpToken);
  if (isNullish(icp)) return [];

  const restOfTokens = userTokensData
    .filter((t) => !isIcpToken(t))
    .filter(({ universeId }) =>
      filterAbandonedProjects({ universeId: universeId.toText() })
    )
    // TODO: Introduce alternative logic for when ICPSwap is down
    .filter((t) => t?.balanceInUsd ?? 0 > 0)
    .sort(compareTokens)
    .slice(0, MAX_NUMBER_OF_ITEMS);

  return [icp, ...restOfTokens];
};

const compareProjectsByUsdBalance = createDescendingComparator(
  (project: TableProject) => project?.stakeInUsd ?? 0 > 0
);

const compareProjects = mergeComparators([
  compareProjectsByUsdBalance,
  compareByProjectTitle,
]);

/**
 * Filters and sorts projects based on specific criteria:
 * - ICP is always first
 * - Sorts remaining tokens by USD balance
 * - Limits the number of returned tokens to MAX_NUMBER_OF_ITEMS
 */
export const getTopStakedTokens = ({
  projects,
}: {
  projects: TableProject[];
}): TableProject[] => {
  const icpProject = projects.find(isIcpProject);
  if (isNullish(icpProject)) return [];

  const restOfProjects = [...projects]
    .filter((p) => !isIcpProject(p))
    .filter(filterAbandonedProjects)
    // TODO: Introduce alternative logic for when ICPSwap is down
    .filter((p) => p?.stakeInUsd ?? 0 > 0)
    .sort(compareProjects)
    .slice(0, MAX_NUMBER_OF_ITEMS);

  return [icpProject, ...restOfProjects];
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
    (currentCardNumberOfTokens < 3 && otherCardNumberOfTokens < 3)
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
