import type { SnsSwap, SnsSwapInit, SnsSwapState } from "@dfinity/sns";
import type { SnsSummary } from "../types/sns";
import type { QuerySnsSummary, QuerySnsSwapState } from "../types/sns.query";
import { assertNonNullish } from "./asserts.utils";
import { fromNullable } from "./did.utils";

type OptionalSwapSummary = QuerySnsSummary & {
  swap?: SnsSwap;
};

type ValidSwapSummary = Required<OptionalSwapSummary>;

/**
 * 1. Concat Sns queries for summaries and swap state.
 * 2. Filter Sns without Swaps data
 */
export const concatSnsSummaries = ([summaries, swaps]: [
  QuerySnsSummary[],
  QuerySnsSwapState[]
]): SnsSummary[] => {
  const allSummaries: OptionalSwapSummary[] = summaries.map(
    ({ rootCanisterId, ...rest }: SnsSummary) => ({
      rootCanisterId,
      ...rest,
      swap: fromNullable(
        swaps.find(
          ({ rootCanisterId: swapRootCanisterId }: QuerySnsSwapState) =>
            swapRootCanisterId === rootCanisterId.toText()
        )?.swap ?? []
      ),
    })
  );

  const validSwapSummaries: ValidSwapSummary[] = allSummaries.filter(
    (entry: OptionalSwapSummary): entry is ValidSwapSummary =>
      entry.swap !== undefined &&
      fromNullable(entry.swap.init) !== undefined &&
      fromNullable(entry.swap.state) !== undefined
  );

  return validSwapSummaries.map(({ swap, ...rest }) => ({
    ...rest,
    swap: {
      // We know for sure that init and state are defined because we check in previous filter that there are not undefined
      // TODO: There might be a cleaner way than a type cast to make TypeScript checks these are defined
      init: fromNullable(swap.init) as SnsSwapInit,
      state: fromNullable(swap.state) as SnsSwapState,
    },
  }));
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
    swap: {
      init,
      state,
    },
  };
};
