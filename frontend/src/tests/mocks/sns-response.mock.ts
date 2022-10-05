import type {
  SnsSwap,
  SnsSwapDerivedState,
  SnsSwapLifecycle,
} from "@dfinity/sns";
import type { SnsSummarySwap } from "$lib/types/sns";
import type {
  QuerySnsMetadata,
  QuerySnsSwapState,
} from "$lib/types/sns.query";
import {
  mockDerived,
  mockQueryMetadata,
  principal,
  summaryForLifecycle,
} from "./sns-projects.mock";
import { swapCanisterIdMock } from "./sns.api.mock";

const swapToQuerySwap = (swap: SnsSummarySwap): [SnsSwap] => [
  {
    ...swap,
    params: [{ ...swap.params }],
  },
];

export const snsResponsesForLifecycle = ({
  certified = false,
  lifecycles,
}: {
  lifecycles: SnsSwapLifecycle[];
  certified?: boolean;
}): [QuerySnsMetadata[], QuerySnsSwapState[]] => [
  [
    ...lifecycles.map((lifecycle, i) => ({
      ...mockQueryMetadata,
      rootCanisterId: principal(i).toText(),
      certified,
    })),
  ],
  [
    ...lifecycles.map((lifecycle, i) => ({
      rootCanisterId: principal(i).toText(),
      swapCanisterId: swapCanisterIdMock,
      swap: swapToQuerySwap(summaryForLifecycle(lifecycle).swap),
      derived: [mockDerived] as [SnsSwapDerivedState],
      certified,
    })),
  ],
];
