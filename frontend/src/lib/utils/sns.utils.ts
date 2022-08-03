import { AccountIdentifier, SubAccount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type {
  SnsSwap,
  SnsSwapDerivedState,
  SnsSwapInit,
  SnsSwapState,
} from "@dfinity/sns";
import type { SnsSummary } from "../types/sns";
import type { QuerySnsSummary, QuerySnsSwapState } from "../types/sns.query";
import { fromNullable } from "./did.utils";

type OptionalSwapSummary = QuerySnsSummary & {
  swap?: SnsSwap;
  derived?: SnsSwapDerivedState;
  swapCanisterId?: Principal;
};

type ValidSwapSummary = Required<OptionalSwapSummary>;

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
 * 1. Concat Sns queries for summaries and swap state.
 * 2. Filter those Sns without swap and derived information
 * 3. Sort according swap start date
 *
 * Note from NNS team about mandatory swap and derived data that are defined as optional in Candid:
 *
 * Swap state and Derived State should always be populated.
 * They are optional as that is the best strategy for backwards compatibility from the protobuf side, which is what we derive our candid APIs from.
 * If either of those are missing, that would indicate a bigger issue with the swap canister and can be safely ignored from the nns-dapp.
 *
 */
export const mapAndSortSnsQueryToSummaries = ({
  summaries,
  swaps,
}: {
  summaries: QuerySnsSummary[];
  swaps: QuerySnsSwapState[];
}): SnsSummary[] => {
  const allSummaries: OptionalSwapSummary[] = summaries.map(
    ({ rootCanisterId, ...rest }: OptionalSwapSummary) => {
      const swapState = swaps.find(
        ({ rootCanisterId: swapRootCanisterId }: QuerySnsSwapState) =>
          swapRootCanisterId === rootCanisterId.toText()
      );
      return {
        rootCanisterId,
        ...rest,
        swapCanisterId: swapState?.swapCanisterId,
        swap: fromNullable(swapState?.swap ?? []),
        derived: fromNullable(swapState?.derived ?? []),
      };
    }
  );

  // Only those that have valid sale and derived information are - and can be - considered as valid
  const validSwapSummaries: ValidSwapSummary[] = allSummaries.filter(
    (entry: OptionalSwapSummary): entry is ValidSwapSummary =>
      entry.swap !== undefined &&
      fromNullable(entry.swap.init) !== undefined &&
      fromNullable(entry.swap.state) !== undefined &&
      entry.swapCanisterId !== undefined &&
      entry.derived !== undefined
  );

  return sortSnsSummaries(
    validSwapSummaries.map(({ swap, ...rest }) => ({
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
