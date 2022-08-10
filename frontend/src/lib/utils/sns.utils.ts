import { AccountIdentifier, ICP, SubAccount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsMetadataResponseEntries,
  SnsSwapLifecycle,
  type SnsGetMetadataResponse,
  type SnsSwap,
  type SnsSwapDerivedState,
  type SnsSwapInit,
  type SnsSwapState,
  type SnsTokenMetadataResponse,
} from "@dfinity/sns";
import { fromDefinedNullable, fromNullable } from "@dfinity/utils";
import type { SnsFullProject } from "../stores/projects.store";
import type {
  SnsSummary,
  SnsSummaryMetadata,
  SnsTokenMetadata,
} from "../types/sns";
import type {
  QuerySns,
  QuerySnsMetadata,
  QuerySnsSwapState,
} from "../types/sns.query";
import type { I18nSubstitutions } from "./i18n.utils";
import { formatICP } from "./icp.utils";

type OptionalSummary = QuerySns & {
  metadata?: SnsSummaryMetadata;
  token?: SnsTokenMetadata;
  swap?: SnsSwap;
  derived?: SnsSwapDerivedState;
  swapCanisterId?: Principal;
};

type ValidSummary = Required<OptionalSummary>;

/**
 * Sort Sns summaries according their swap start dates. Sooner dates first.
 * @param summaries
 */
const sortSnsSummaries = (summaries: SnsSummary[]): SnsSummary[] =>
  summaries.sort(
    (
      {
        swap: {
          state: { open_time_window: openTimeWindowA },
        },
      }: SnsSummary,
      {
        swap: {
          state: { open_time_window: openTimeWindowB },
        },
      }: SnsSummary
    ) =>
      (openTimeWindowA[0]?.start_timestamp_seconds ?? 0) <
      (openTimeWindowB[0]?.start_timestamp_seconds ?? 0)
        ? -1
        : 1
  );

/**
 * Metadata is given only if all its properties are defined.
 */
const mapOptionalMetadata = ({
  logo,
  url,
  name,
  description,
}: SnsGetMetadataResponse): SnsSummaryMetadata | undefined => {
  const nullishLogo = fromNullable(logo);
  const nullishUrl = fromNullable(url);
  const nullishName = fromNullable(name);
  const nullishDescription = fromNullable(description);

  if (
    nullishLogo === undefined ||
    nullishUrl === undefined ||
    nullishName === undefined ||
    nullishDescription === undefined
  ) {
    return undefined;
  }

  return {
    logo: nullishLogo,
    url: nullishUrl,
    name: nullishName,
    description: nullishDescription,
  } as SnsSummaryMetadata;
};

/**
 * Token metadata is given only if the properties NNS-dapp needs (name and symbol) are defined.
 */
const mapOptionalToken = (
  response: SnsTokenMetadataResponse
): SnsTokenMetadata | undefined => {
  const nullishToken: Partial<SnsTokenMetadata> = response.reduce(
    (acc, [key, value]) => {
      switch (key) {
        case SnsMetadataResponseEntries.SYMBOL:
          acc = { ...acc, ...("Text" in value && { symbol: value.Text }) };
          break;
        case SnsMetadataResponseEntries.NAME:
          acc = { ...acc, ...("Text" in value && { name: value.Text }) };
      }

      return acc;
    },
    {}
  );

  if (nullishToken.name === undefined || nullishToken.symbol === undefined) {
    return undefined;
  }

  return nullishToken as SnsTokenMetadata;
};

/**
 * 1. Concat Sns queries for metadata and swap state.
 * 2. Filter those Sns without metadata, swap and derived information
 * 3. Sort according swap start date
 *
 * Note from NNS team about mandatory swap and derived data that are defined as optional in Candid:
 *
 * Swap state and Derived State should always be populated.
 * They are optional as that is the best strategy for backwards compatibility from the protobuf side, which is what we derive our candid APIs from.
 * If either of those are missing, that would indicate a bigger issue with the swap canister and can be safely ignored from the nns-dapp.
 *
 * Note about mandatory Metadata:
 *
 * Having mandatory metadata values is the cleanest solution from code perspective but also from feature perspective, user need information to invest in sales they trust.
 * This might evolve in the future but at least for a first version it is the best approach for above reasons.
 *
 */
export const mapAndSortSnsQueryToSummaries = ({
  metadata,
  swaps,
}: {
  metadata: QuerySnsMetadata[];
  swaps: QuerySnsSwapState[];
}): SnsSummary[] => {
  const allSummaries: OptionalSummary[] = metadata.map(
    ({ rootCanisterId, metadata, token, ...rest }: QuerySnsMetadata) => {
      const swapState = swaps.find(
        ({ rootCanisterId: swapRootCanisterId }: QuerySnsSwapState) =>
          swapRootCanisterId === rootCanisterId
      );
      return {
        ...rest,
        rootCanisterId,
        metadata: mapOptionalMetadata(metadata),
        token: mapOptionalToken(token),
        swapCanisterId: swapState?.swapCanisterId,
        swap: fromNullable(swapState?.swap ?? []),
        derived: fromNullable(swapState?.derived ?? []),
      };
    }
  );

  // Only those that have valid metadata, toke, sale and derived information are - and can be - considered as valid
  const validSwapSummaries: ValidSummary[] = allSummaries.filter(
    (entry: OptionalSummary): entry is ValidSummary =>
      entry.swap !== undefined &&
      fromNullable(entry.swap.init) !== undefined &&
      fromNullable(entry.swap.state) !== undefined &&
      entry.swapCanisterId !== undefined &&
      entry.derived !== undefined &&
      entry.metadata !== undefined &&
      entry.token !== undefined
  );

  return sortSnsSummaries(
    validSwapSummaries.map(({ swap, rootCanisterId, ...rest }) => ({
      rootCanisterId: Principal.fromText(rootCanisterId),
      ...rest,
      swap: {
        // We know for sure that init and state are defined because we check in previous filter that there are not undefined
        init: fromDefinedNullable<SnsSwapInit>(swap.init),
        state: fromDefinedNullable<SnsSwapState>(swap.state),
      },
    }))
  );
};

export const getSwapCanisterAccount = ({
  controller,
  swapCanisterId,
}: {
  controller: Principal;
  swapCanisterId: Principal;
}): AccountIdentifier => {
  const principalSubaccount = SubAccount.fromPrincipal(controller);
  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal: swapCanisterId,
    subAccount: principalSubaccount,
  });

  return accountIdentifier;
};

const isProjectOpen = (project: SnsFullProject): boolean =>
  project.summary.swap.state.lifecycle === SnsSwapLifecycle.Open;
const isEnoughAmount = ({
  project,
  amount,
}: {
  project: SnsFullProject;
  amount: ICP;
}): boolean =>
  project.summary.swap.init.min_participant_icp_e8s <= amount.toE8s();
const commitmentTooLarge = ({
  project,
  amountE8s,
}: {
  project: SnsFullProject;
  amountE8s: bigint;
}): boolean => project.summary.swap.init.max_participant_icp_e8s < amountE8s;

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
  if (!isProjectOpen(project)) {
    return {
      valid: false,
      labelKey: "error__sns.project_not_open",
    };
  }
  if (!isEnoughAmount({ project, amount })) {
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
  const totalCommitment =
    (project.swapCommitment?.myCommitment?.amount_icp_e8s ?? BigInt(0)) +
    amount.toE8s();
  if (commitmentTooLarge({ project, amountE8s: totalCommitment })) {
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
  return { valid: true };
};
