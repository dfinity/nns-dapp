import { AccountIdentifier, SubAccount } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsSwap, SnsSwapInit, SnsSwapState } from "@dfinity/sns";
import type { SnsSummary } from "../types/sns";
import type { QuerySnsSummary, QuerySnsSwapState } from "../types/sns.query";
import { assertNonNullish } from "./asserts.utils";
import { fromNullable } from "./did.utils";

type OptionalSwapSummary = QuerySnsSummary & {
  swap?: SnsSwap;
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
 * 2. Filter those Sns without Swaps data
 * 3. Sort according swap start date
 */
export const mapAndSortSnsQueryToSummaries = ([summaries, swaps]: [
  QuerySnsSummary[],
  QuerySnsSwapState[]
]): SnsSummary[] => {
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
      };
    }
  );

  const validSwapSummaries: ValidSwapSummary[] = allSummaries.filter(
    (entry: OptionalSwapSummary): entry is ValidSwapSummary =>
      entry.swap !== undefined &&
      fromNullable(entry.swap.init) !== undefined &&
      fromNullable(entry.swap.state) !== undefined &&
      entry.swapCanisterId !== undefined
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

export const concatSnsSummary = ([summary, swap]: [
  QuerySnsSummary | undefined,
  QuerySnsSwapState | undefined
]): SnsSummary => {
  assertNonNullish(summary);
  assertNonNullish(swap);

  // Not sure, this should ever happen
  const possibleSwap: SnsSwap | undefined = fromNullable(swap?.swap);

  assertNonNullish(possibleSwap);

  const { init: possibleInit, state: possibleState } = possibleSwap;

  const init: SnsSwapInit | undefined = fromNullable(possibleInit);
  const state: SnsSwapState | undefined = fromNullable(possibleState);

  assertNonNullish(init);
  assertNonNullish(state);

  return {
    ...summary,
    swapCanisterId: swap.swapCanisterId,
    swap: {
      init,
      state,
    },
  };
};

export const getSwapCanisterAccount = ({
  controller,
  swapCanisterId,
}: {
  controller: Principal;
  swapCanisterId: Principal;
}): AccountIdentifier => {
  const principalSubaccont = SubAccount.fromPrincipal(controller);
  const accountIdentifier = AccountIdentifier.fromPrincipal({
    principal: swapCanisterId,
    subAccount: principalSubaccont,
  });

  return accountIdentifier;
};
