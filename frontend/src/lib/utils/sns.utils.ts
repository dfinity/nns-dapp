import { AccountIdentifier, SubAccount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import type {
  SnsGetMetadataResponse,
  SnsSwap,
  SnsSwapDerivedState,
  SnsSwapInit,
  SnsSwapState,
} from "@dfinity/sns";
import { mockSnsSummaryList } from "../../tests/mocks/sns-projects.mock";
import type { SnsSummary, SnsSummaryMetadata } from "../types/sns";
import type { QuerySnsMetadata, QuerySnsSwapState } from "../types/sns.query";
import { fromNullable } from "./did.utils";

type OptionalSummary = Omit<QuerySnsMetadata, "metadata"> & {
  metadata?: SnsSummaryMetadata;
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
  };
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
    ({ rootCanisterId, metadata, ...rest }: QuerySnsMetadata) => {
      const swapState = swaps.find(
        ({ rootCanisterId: swapRootCanisterId }: QuerySnsSwapState) =>
          swapRootCanisterId === rootCanisterId
      );
      return {
        ...rest,
        rootCanisterId,
        metadata: mapOptionalMetadata(metadata),
        swapCanisterId: swapState?.swapCanisterId,
        swap: fromNullable(swapState?.swap ?? []),
        derived: fromNullable(swapState?.derived ?? []),
      };
    }
  );

  // Only those that have valid metadata, sale and derived information are - and can be - considered as valid
  const validSwapSummaries: ValidSummary[] = allSummaries.filter(
    (entry: OptionalSummary): entry is ValidSummary =>
      entry.swap !== undefined &&
      fromNullable(entry.swap.init) !== undefined &&
      fromNullable(entry.swap.state) !== undefined &&
      entry.swapCanisterId !== undefined &&
      entry.derived !== undefined &&
      entry.metadata !== undefined
  );

  return sortSnsSummaries(
    validSwapSummaries.map(({ swap, rootCanisterId, ...rest }) => ({
      // TODO: remove mock data
      ...mockSnsSummaryList[0],
      rootCanisterId: Principal.fromText(rootCanisterId),
      ...rest,
      swap: {
        // We know for sure that init and state are defined because we check in previous filter that there are not undefined
        // TODO: There might be a cleaner way than a type cast to make TypeScript checks these are defined
        init: fromNullable(swap.init) as SnsSwapInit,
        state: fromNullable(swap.state) as SnsSwapState,
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
