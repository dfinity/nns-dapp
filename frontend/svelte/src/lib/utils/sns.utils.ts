import type { Init, State, Swap } from "@dfinity/sns";
import type { QuerySnsSwapState } from "../api/sns.api";
import type { SnsSummary } from "../types/sns";
import { fromNullable } from "./did.utils";

type OptionalSwapSummary = Omit<SnsSummary, "swap"> & {
  swap?: Swap;
};

type ValidSwapSummary = Required<OptionalSwapSummary>;

/**
 * 1. Concat Sns queries for summaries and swap state.
 * 2. Filter Sns without Swaps data
 */
export const concatSnsSummaries = ([summaries, swaps]: [
  Omit<SnsSummary, "swap">[],
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
      details: fromNullable(swap.init) as Init,
      state: fromNullable(swap.state) as State,
    },
  }));
};

export const concatSnsSummary = ([summary, swap]: [
  Omit<SnsSummary, "swap"> | undefined,
  QuerySnsSwapState | undefined
]): SnsSummary | undefined => {
  if (!summary || !swap) {
    return undefined;
  }

  // Not sure this should ever happen
  const possibleSwap: Swap | undefined = fromNullable(swap?.swap);
  if (possibleSwap === undefined) {
    return undefined;
  }

  const { init, state: possibleState } = possibleSwap;

  const details: Init | undefined = fromNullable(init);
  const state: State | undefined = fromNullable(possibleState);

  if (details === undefined || state === undefined) {
    return undefined;
  }

  return {
    ...summary,
    swap: {
      details,
      state,
    },
  };
};

export enum ProjectStatus {
  Accepting = "accepting",
  Pending = "pending",
  Closed = "closed",
}

export const getProjectStatus = ({
  summary,
  nowInSeconds,
}: {
  summary: SnsSummary;
  nowInSeconds: number;
}): ProjectStatus =>
  BigInt(nowInSeconds) > summary.swapDeadline
    ? ProjectStatus.Closed
    : nowInSeconds < summary.swapStart
    ? ProjectStatus.Pending
    : ProjectStatus.Accepting;
